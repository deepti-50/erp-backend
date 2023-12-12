import mongoose from "mongoose";
import {
  createFaculty,
  facultyList,
  deleteFacultyById,
  updateFacultyById,
} from "#services/faculty";
import {
  createEmployeeBank,
  // employeeBankList,
  // deleteEmployeeBankById,
  // updateEmployeeBankById,
} from "#services/employee/empBank";
import {
  addNewEmployeeCurrent,
  // getEmployeeCurrent,
  // deleteEmployeeCurrentById,
  // updateEmployeeCurrentById,
} from "#services/employee/empCurrentDetail";
import {
  createEmployeeEducationHistory,
  // employeeEducationHistoryList,
  // deleteEmployeeEducationHistoryById,
  // updateEmployeeEducationHistoryById,
} from "#services/employee/empEduHistory";
import {
  addNewEmployeePersonal,
  // getEmployeePersonal,
  // deleteEmployeePersonalById,
  // updateEmployeePersonalById,
} from "#services/employee/empPersonal";
import { logger } from "#util";

async function addFaculty(req, res) {
  const {
    ERPID,
    dateOfJoining,
    dateOfLeaving,
    profileLink,
    qualifications,
    totalExperience,
    achievements,
    areaOfSpecialization,
    papersPublishedPG,
    papersPublishedUG,
    department,
    preferredSubjects,
    designation,
    natureOfAssociation,
    additionalResponsibilities,
    employeePersonalDetails,
    employeeBankDetails,
    employeeCurrentDetails,
    employeeEducationDetails,
  } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newFaculty = await createFaculty(
      ERPID,
      dateOfJoining,
      dateOfLeaving,
      profileLink,
      qualifications,
      totalExperience,
      achievements,
      areaOfSpecialization,
      papersPublishedPG,
      papersPublishedUG,
      department,
      preferredSubjects,
      designation,
      natureOfAssociation,
      additionalResponsibilities,
      session,
    );
    await Promise.all([
      addNewEmployeePersonal(employeePersonalDetails, session),
      createEmployeeEducationHistory(employeeEducationDetails, session),
      addNewEmployeeCurrent(employeeCurrentDetails, session),
      createEmployeeBank(employeeBankDetails, session),
    ]);
    res.json({
      res: `added faculty ${newFaculty.ERPID}`,
      id: newFaculty.ERPID,
    });
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Error while inserting", error);
    res.status(500);
    res.json({ err: "Error while inserting in DB" });
  }
}

async function getFaculty(req, res) {
  try {
    const filter = req.body;
    const { limit, page } = req.query;
    const facultylist = await facultyList(filter, limit, page);
    res.json({ res: facultylist });
  } catch (error) {
    logger.error("Error while fetching", error);
    res.status(500);
    res.json({ err: "Error while fetching the data" });
  }
}

async function deleteFaculty(req, res) {
  const { facultyId } = req.params;
  try {
    await deleteFacultyById(facultyId);
    res.json({ res: "Faculty deleted successfully" });
  } catch (error) {
    logger.error("Error while deleting", error);
    res.status(500);
    res.json({ err: "Error while deleting from DB" });
  }
}

async function updateFaculty(req, res) {
  const { id, ...data } = req.body;
  try {
    await updateFacultyById(id, data);
    res.json({ res: `updated faculty with id ${id}` });
  } catch (error) {
    logger.error("Error while updating", error);
    res.status(500);
    res.json({ err: "Error while updating in DB" });
  }
}

export default {
  addFaculty,
  getFaculty,
  deleteFaculty,
  updateFaculty,
};
