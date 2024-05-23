const Ride = require("../models/Ride");
const User = require("../models/User");

//Create Ride handler function
exports.createRide = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;

    //fetch data
    let { fromWhere, toWhere, date, time, noOfSeats, journeyTime, price } =
      req.body;

    // Find the ride id
    const userDetails = await User.findById(userId);
    const ride = await Ride.findById(userDetails.ridePublished);

    //validation
    if (
      !fromWhere ||
      !toWhere ||
      !date ||
      !time ||
      !noOfSeats ||
      !journeyTime ||
      !price
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are Mandatory!",
      });
    }
    // Create a ride with the given details
    ride.fromWhere = fromWhere;
    ride.toWhere = toWhere;
    ride.date = date;
    ride.time = time;
    ride.noOfSeats = noOfSeats;
    ride.journeyTime = journeyTime;
    ride.price = price;

    await ride.save();

    const newRide = await User.findById(userId).populate("ridePublished").exec();

    // Return the new ride and a success message
    res.status(200).json({
      success: true,
      data: newRide,
      message: "Ride Created Successfully",
    });
  } catch (error) {
    // Handle any errors that occur during the creation of the ride
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create ride",
      error: error.message,
    });
  }
};

//Add Stop Point handler function
// exports.addStopPoint = async (req, res) => {
//   try {
//     //fetch data
//     let { stopPoints } = req.body;

//     // Get user ID from request object
//     const userId = req.user.id;

//     // Find the ride id;
//     const rideId = await Ride.findById(userId);

//     //validation
//     if (!stopPoints) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are Mandatory!",
//       });
//     }

//     // Add stop points to ride
//     const updatedRide = await Ride.findByIdAndUpdate(
//       rideId,
//       { $push: { stopPoints: { $each: stopPoints } } },
//       { new: true }
//     );

//     if (!updatedRide) {
//       return res.status(404).json({ error: "Ride not found" });
//     }

//     res.json(updatedRide);

//     // Return the new ride and a success message
//     res.status(200).json({
//       success: true,
//       data: updatedRide,
//       message: "Stop points added Successfully",
//     });
//   } catch (error) {
//     // Handle any errors that occur during add stop point
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to add stop points",
//       error: error.message,
//     });
//   }
// };
