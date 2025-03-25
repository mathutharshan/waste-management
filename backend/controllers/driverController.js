import driverModel from "../models/driverModel.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await driverModel.findById(docId);

    if (!docData) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    await driverModel.findByIdAndUpdate(docId, { available: !docData.available });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log("Error changing availability:", error);
    res.json({ success: false, message: error.message });
  }
};

const driverList = async (req,res)=>{
    try {
        const drivers = await driverModel.find({}).select(['-password','-email'])
        res.json({success:true,drivers})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { changeAvailability, driverList };
