import { Request, Response } from 'express';
import MaterialIssue from '../models/MaterialIssue.model';
import Material from '../models/Material.model';
import Expense from '../models/Expense.model';
import Project from '../models/Project.model';
import mongoose from 'mongoose';

// Create material issue (consume material and log expense)
export const createMaterialIssue = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { project, material, quantity, issueDate, notes } = req.body;
    const user = (req as any).user;
    const userId = user?._id || user?.id;

    // Validate required fields
    if (!project || !material || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Project, material, and quantity are required',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
    }

    // Fetch material with current stock and avg cost
    const materialDoc = await Material.findById(material);
    if (!materialDoc) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    // Check if sufficient stock is available
    if (materialDoc.currentStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${materialDoc.currentStock} ${materialDoc.unit}`,
      });
    }

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Calculate costs
    const unitCost = materialDoc.avgUnitCost || materialDoc.costPerUnit;
    const totalCost = quantity * unitCost;

    // Create material issue record
    const materialIssue = new MaterialIssue({
      project,
      material,
      quantity,
      unitCost,
      totalCost,
      issueDate: issueDate || new Date(),
      issuedBy: userId,
      notes,
    });

    await materialIssue.save();

    // CRITICAL OPERATION 1: Deduct from material stock
    materialDoc.currentStock -= quantity;
    await materialDoc.save();

    // CRITICAL OPERATION 2: Log project expense
    // Generate expense number
    const expenseCount = await Expense.countDocuments();
    const expenseNumber = `EXP-${String(expenseCount + 1).padStart(6, '0')}`;

    const expense = new Expense({
      expenseNumber,
      project,
      category: 'Other',
      expenseType: 'Material',
      description: `Material Issue: ${materialDoc.name} (${quantity} ${materialDoc.unit})`,
      amount: totalCost,
      date: issueDate || new Date(),
      paymentStatus: 'Paid', // Considered paid as it's from inventory
      createdBy: userId,
      notes: notes || `Material consumed from inventory - ${materialDoc.sku}`,
    });

    await expense.save();

    // Populate the response
    const populatedIssue = await MaterialIssue.findById(materialIssue._id)
      .populate('project', 'projectName projectCode')
      .populate('material', 'name sku unit')
      .populate('issuedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Material issued successfully and expense logged',
      data: populatedIssue,
    });
  } catch (error: any) {
    console.error('Error creating material issue:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create material issue',
    });
  }
};

// Get all material issues
export const getMaterialIssues = async (req: Request, res: Response) => {
  try {
    const { project, material, startDate, endDate } = req.query;

    const filter: any = {};
    if (project) filter.project = project;
    if (material) filter.material = material;
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate as string);
      if (endDate) filter.issueDate.$lte = new Date(endDate as string);
    }

    const issues = await MaterialIssue.find(filter)
      .populate('project', 'projectName projectCode location')
      .populate('material', 'name sku unit category')
      .populate('issuedBy', 'name email')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error: any) {
    console.error('Error fetching material issues:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch material issues',
    });
  }
};

// Get material issues by project
export const getMaterialIssuesByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const issues = await MaterialIssue.find({ project: projectId })
      .populate('material', 'name sku unit category avgUnitCost')
      .populate('issuedBy', 'name email')
      .sort({ issueDate: -1 });

    // Calculate total consumption cost
    const totalCost = issues.reduce((sum, issue) => sum + issue.totalCost, 0);

    res.status(200).json({
      success: true,
      count: issues.length,
      totalCost,
      data: issues,
    });
  } catch (error: any) {
    console.error('Error fetching project material issues:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch project material issues',
    });
  }
};

// Get material consumption summary by project
export const getMaterialConsumptionSummary = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const summary = await MaterialIssue.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: {
          _id: '$material',
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$totalCost' },
          issueCount: { $sum: 1 },
          lastIssueDate: { $max: '$issueDate' },
        },
      },
      {
        $lookup: {
          from: 'materials',
          localField: '_id',
          foreignField: '_id',
          as: 'material',
        },
      },
      { $unwind: '$material' },
      {
        $project: {
          materialName: '$material.name',
          materialSku: '$material.sku',
          unit: '$material.unit',
          category: '$material.category',
          totalQuantity: 1,
          totalCost: 1,
          issueCount: 1,
          lastIssueDate: 1,
        },
      },
      { $sort: { totalCost: -1 } },
    ]);

    const overallTotal = summary.reduce((sum, item) => sum + item.totalCost, 0);

    res.status(200).json({
      success: true,
      count: summary.length,
      overallTotal,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error fetching consumption summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch consumption summary',
    });
  }
};

// Get single material issue
export const getMaterialIssueById = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const issue = await MaterialIssue.findById(id)
      .populate('project', 'projectName projectCode location')
      .populate('material', 'name sku unit category avgUnitCost currentStock')
      .populate('issuedBy', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Material issue not found',
      });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error: any) {
    console.error('Error fetching material issue:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch material issue',
    });
  }
};

// Delete material issue (reverse the stock deduction)
export const deleteMaterialIssue = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const issue = await MaterialIssue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Material issue not found',
      });
    }

    // Restore material stock
    const material = await Material.findById(issue.material);
    if (material) {
      material.currentStock += issue.quantity;
      await material.save();
    }

    // Delete the issue
    await MaterialIssue.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Material issue deleted and stock restored',
    });
  } catch (error: any) {
    console.error('Error deleting material issue:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete material issue',
    });
  }
};
