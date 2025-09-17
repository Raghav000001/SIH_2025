import FeeStructure from "../models/feesStructure.modal.js";


export const createFeeStructure = async (req, res) => {
  try {
    if (req.user.role !== "director") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only director can create fee structures",
      });
    }

    const {
      course,
      year,
      tuitionFee,
      hostelFee,
      libraryFee,
      transportFee,
      otherCharges,
      totalFee
    } = req.body;

    // Check if already exists for same course+year
    const existing = await FeeStructure.findOne({ course, year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Fee structure already exists for this course and year.",
      });
    }

    const feeStructure = new FeeStructure({
      course,
      year,
      tuitionFee,
      hostelFee,
      libraryFee,
      transportFee,
      otherCharges,
      totalFee,
      createdBy: req.user._id,
    });

    await feeStructure.save();

    res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      data: feeStructure,
    });
  } catch (error) {
    console.error("Error creating fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating fee structure",
    });
  }
};

//  Get All Fee Structures (all roles can view)
export const getFeeStructures = async (req, res) => {
  try {
    const feeStructures = await FeeStructure.find().populate(
      "createdBy",
      "name email role"
    );

    res.status(200).json({
      success: true,
      count: feeStructures.length,
      data: feeStructures,
    });
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//Get Fee Structure by ID (all roles can view)
export const getFeeStructureById = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id);
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }
    res.status(200).json({ success: true, data: feeStructure });
  } catch (error) {
    console.error("Error fetching fee structure:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Fee Structure (only director allowed)
export const updateFeeStructure = async (req, res) => {
  try {
    if (req.user.role !== "director") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only director can update fee structures",
      });
    }

    const feeStructure = await FeeStructure.findById(req.params.id);
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    Object.assign(feeStructure, req.body);
    await feeStructure.save();

    res.status(200).json({
      success: true,
      message: "Fee structure updated successfully",
      data: feeStructure,
    });
  } catch (error) {
    console.error("Error updating fee structure:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Fee Structure (only director allowed)
export const deleteFeeStructure = async (req, res) => {
  try {
    if (req.user.role !== "director") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only director can delete fee structures",
      });
    }

    const feeStructure = await FeeStructure.findByIdAndDelete(req.params.id);
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fee structure deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fee structure:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
