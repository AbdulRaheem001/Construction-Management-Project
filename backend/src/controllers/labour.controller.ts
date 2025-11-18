import { Response, NextFunction } from 'express';
import Employee from '../models/Employee.model';
import Timesheet from '../models/Timesheet.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// ===== EMPLOYEES =====

export const createEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const employee = await Employee.create(req.body);
    logger.info(`Employee created: ${employee.employeeId}`);

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Employee ID already exists', 400));
    }
    next(error);
  }
};

export const getEmployees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { team, role, search } = req.query;

    const query: any = { isActive: true };
    if (team) query.team = team;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    logger.info(`Employee updated: ${employee.employeeId}`);

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// ===== TIMESHEETS =====

export const createTimesheet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const timesheetData = {
      ...req.body,
      submittedBy: req.user._id,
    };

    const timesheet = await Timesheet.create(timesheetData);
    logger.info(`Timesheet created for employee: ${timesheet.employee}`);

    res.status(201).json({
      success: true,
      data: timesheet,
    });
  } catch (error) {
    next(error);
  }
};

export const getTimesheets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employee, project, status, startDate, endDate } = req.query;

    const query: any = {};
    if (employee) query.employee = employee;
    if (project) query.project = project;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const timesheets = await Timesheet.find(query)
      .populate('employee', 'employeeId name role payRate payType')
      .populate('project', 'projectName projectCode')
      .populate('submittedBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: timesheets.length,
      data: timesheets,
    });
  } catch (error) {
    next(error);
  }
};

export const approveTimesheet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const timesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!timesheet) {
      return next(new AppError('Timesheet not found', 404));
    }

    logger.info(`Timesheet approved: ${timesheet._id}`);

    res.json({
      success: true,
      data: timesheet,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectTimesheet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rejectionReason } = req.body;

    const timesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        rejectionReason,
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!timesheet) {
      return next(new AppError('Timesheet not found', 404));
    }

    logger.info(`Timesheet rejected: ${timesheet._id}`);

    res.json({
      success: true,
      data: timesheet,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayrollReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, project } = req.query;

    const query: any = { status: 'Approved' };
    if (project) query.project = project;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const timesheets = await Timesheet.find(query)
      .populate('employee', 'employeeId name role payRate payType')
      .populate('project', 'projectName projectCode');

    // Calculate wages
    const payrollData = timesheets.reduce((acc: any, timesheet: any) => {
      const employeeId = timesheet.employee._id.toString();

      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee: timesheet.employee,
          totalHours: 0,
          totalWages: 0,
          timesheets: [],
        };
      }

      const hours = timesheet.hoursWorked;
      const wages = hours * timesheet.employee.payRate;

      acc[employeeId].totalHours += hours;
      acc[employeeId].totalWages += wages;
      acc[employeeId].timesheets.push({
        date: timesheet.date,
        hours,
        project: timesheet.project,
      });

      return acc;
    }, {});

    const report = Object.values(payrollData);

    res.json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
