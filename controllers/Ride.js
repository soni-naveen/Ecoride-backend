const User = require("../models/User");
const Profile = require("../models/Profile");
const Ride = require("../models/Ride");
const BookedRide = require("../models/BookedRide");

//Create Ride handler function
exports.createRide = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;

    //fetch data
    const {
      ["publishRideData[fromWhere]"]: fromWhere,
      ["publishRideData[toWhere]"]: toWhere,
      ["publishRideData[date]"]: date,
      ["publishRideData[leavingTime]"]: leavingTime,
      ["publishRideData[noOfSeats]"]: noOfSeats,
      ["publishRideData[reachingTime]"]: reachingTime,
      ["publishRideData[price]"]: price,
      ["stopPointData[stopPoint1]"]: stopPoint1,
      ["stopPointData[stopPoint2]"]: stopPoint2,
      ["stopPointData[stopPoint3]"]: stopPoint3,
    } = req.body;

    // Find the ride id
    const userDetails = await User.findById(userId);
    const ride = await Ride.findById(userDetails.ridePublished);

    //validation
    if (
      !fromWhere ||
      !toWhere ||
      !date ||
      !leavingTime ||
      !noOfSeats ||
      !reachingTime ||
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
    ride.leavingTime = leavingTime;
    ride.noOfSeats = noOfSeats;
    ride.reachingTime = reachingTime;
    ride.price = price;
    ride.stopPoint1 = stopPoint1 || "";
    ride.stopPoint2 = stopPoint2 || "";
    ride.stopPoint3 = stopPoint3 || "";

    await ride.save();

    const newRide = await User.findById(userId)
      .populate("additionalDetails")
      .populate({
        path: "ridePublished",
        populate: [
          { path: "pendingPassengers" },
          { path: "confirmedPassengers" },
        ],
      })
      .populate({
        path: "rideBooked",
        populate: [{ path: "profile" }, { path: "ride" }],
      })
      .exec();

    // Return the new ride and a success message
    return res.status(200).json({
      success: true,
      data: newRide,
      message: "Ride Created Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create ride",
      error: error.message,
    });
  }
};

//Delete Ride handler function
exports.deleteRide = async (req, res) => {
  try {
    const id = req.user.id;

    // Find the ride id
    const userDetails = await User.findById(id);
    const ride = await Ride.findById(userDetails.ridePublished);

    const passengerIds = ride.pendingPassengers.map(
      (passenger) => passenger._id
    );

    const pendingPassengerProfiles = await Profile.find({
      _id: { $in: passengerIds },
    });

    const emailAddresses = pendingPassengerProfiles.map(
      (profile) => profile.email
    );

    const bookedRideProfiles = await BookedRide.find({
      email: { $in: emailAddresses },
    });

    const updatePromises = bookedRideProfiles.map((bookedRide) => {
      bookedRide.profile = null;
      bookedRide.ride = null;
      bookedRide.rideStatus = "";
      return bookedRide.save();
    });

    await Promise.all(updatePromises);

    // delete ride details
    ride.fromWhere = "";
    ride.toWhere = "";
    ride.date = "";
    ride.leavingTime = "";
    ride.noOfSeats = 0;
    ride.reachingTime = "";
    ride.price = 0;
    ride.stopPoint1 = "";
    ride.stopPoint2 = "";
    ride.stopPoint3 = "";
    ride.pendingPassengers = [];
    ride.confirmedPassengers = [];

    await ride.save();

    const updatedRideDetails = await User.findByIdAndUpdate(id)
      .populate("additionalDetails")
      .populate({
        path: "ridePublished",
        populate: [
          { path: "pendingPassengers" },
          { path: "confirmedPassengers" },
        ],
      })
      .populate({
        path: "rideBooked",
        populate: [{ path: "profile" }, { path: "ride" }],
      })
      .exec();

    return res.json({
      success: true,
      message: "Ride deleted successfully",
      updatedRideDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Cancel Booked Ride handler function
exports.cancelBookedRide = async (req, res) => {
  try {
    const id = req.user.id;
    const { rideId } = req.body;

    // Find the booked ride id
    const userDetails = await User.findById(id);
    const bookedRide = await BookedRide.findById(userDetails.rideBooked);

    bookedRide.profile = null;
    bookedRide.ride = null;
    bookedRide.rideStatus = "";

    await bookedRide.save();

    const updatedRide = await Ride.findOneAndUpdate(
      { _id: rideId },
      { $pull: { pendingPassengers: userDetails.additionalDetails._id } },
      { $pull: { confirmedPassengers: userDetails.additionalDetails._id } },
      { new: true }
    ).populate("profile");

    const updatedBookedRideDetails = await User.findByIdAndUpdate(id)
      .populate("additionalDetails")
      .populate({
        path: "ridePublished",
        populate: [
          { path: "pendingPassengers" },
          { path: "confirmedPassengers" },
        ],
      })
      .populate({
        path: "rideBooked",
        populate: [{ path: "profile" }, { path: "ride" }],
      })
      .exec();

    return res.json({
      success: true,
      message: "Ride Cancelled Successfully",
      updatedBookedRideDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Automatically delete Ride handler function
exports.autoDeleteRide = async (req, res) => {
  try {
    const id = req.user.id;

    // Find the ride id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);
    const ride = await Ride.findById(userDetails.ridePublished);

    const passengerIds = ride.pendingPassengers.map(
      (passenger) => passenger._id
    );

    const pendingPassengerProfiles = await Profile.find({
      _id: { $in: passengerIds },
    });

    const emailAddresses = pendingPassengerProfiles.map(
      (profile) => profile.email
    );

    const bookedRideProfiles = await BookedRide.find({
      email: { $in: emailAddresses },
    });

    const updatePromises = bookedRideProfiles.map((bookedRide) => {
      bookedRide.profile = null;
      bookedRide.ride = null;
      bookedRide.rideStatus = "";
      return bookedRide.save();
    });

    await Promise.all(updatePromises);

    // delete ride details
    ride.fromWhere = "";
    ride.toWhere = "";
    ride.date = "";
    ride.leavingTime = "";
    ride.noOfSeats = 0;
    ride.reachingTime = "";
    ride.price = 0;
    ride.stopPoint1 = "";
    ride.stopPoint2 = "";
    ride.stopPoint3 = "";
    ride.pendingPassengers = [];
    ride.confirmedPassengers = [];

    //update the ride count
    profile.noOfRidesPublished = profile.noOfRidesPublished + 1;

    await ride.save();
    await profile.save();

    const updatedRideDetails = await User.findById(id)
      .populate("additionalDetails")
      .populate({
        path: "ridePublished",
        populate: [
          { path: "pendingPassengers" },
          { path: "confirmedPassengers" },
        ],
      })
      .populate({
        path: "rideBooked",
        populate: [{ path: "profile" }, { path: "ride" }],
      })
      .exec();

    return res.json({
      success: true,
      message: "Ride deleted successfully",
      updatedRideDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Searched rides handler function
exports.getSearchedRides = async (req, res) => {
  try {
    const { st, dt, date, seats } = req.body;

    // Validate inputs
    if (!st || !dt || !date || !seats) {
      return res.status(400).json({
        success: false,
        error: "Require all fields!",
      });
    }

    // Split by comma, hyphen, or parentheses and trim any surrounding spaces
    const stFirstWord = st.split(/[, ]/)[0].trim();
    const dtFirstWord = dt.split(/[, ]/)[0].trim();

    // Create regex patterns for similar searches
    const stPattern = new RegExp(stFirstWord, "i"); // 'i' for case-insensitive,
    const dtPattern = new RegExp(dtFirstWord, "i");

    // Find rides that match the search criteria
    const searchedRides = await Ride.find({
      $or: [
        {
          $and: [
            { fromWhere: stPattern },
            {
              $or: [
                { stopPoint1: dtPattern },
                { stopPoint2: dtPattern },
                { stopPoint3: dtPattern },
                { toWhere: dtPattern },
              ],
            },
          ],
        },
        {
          $and: [
            { stopPoint1: stPattern },
            {
              $or: [
                { stopPoint2: dtPattern },
                { stopPoint3: dtPattern },
                { toWhere: dtPattern },
              ],
            },
          ],
        },
        {
          $and: [
            { stopPoint2: stPattern },
            { $or: [{ stopPoint3: dtPattern }, { toWhere: dtPattern }] },
          ],
        },
        {
          $and: [{ stopPoint3: stPattern }, { toWhere: dtPattern }],
        },
      ],
      date: date,
      noOfSeats: { $gte: seats },
    })
      .populate("profile")
      .exec();

    return res.status(200).json({
      success: true,
      data: searchedRides,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Get ride details handler function
exports.getRideDetails = async (req, res) => {
  try {
    const { rideId } = req.body;

    const rideDetails = await Ride.findById(rideId)
      .populate("profile")
      .populate("pendingPassengers")
      .populate("confirmedPassengers")
      .exec();

    if (!rideDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find profile with id: ${rideId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: rideDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Get booked ride details handler function
exports.getBookedRideDetails = async (req, res) => {
  try {
    const { bookedRideId } = req.body;

    const bookedRideDetails = await BookedRide.findByIdAndUpdate(bookedRideId)
      .populate("profile")
      .populate("ride")
      .exec();

    if (!bookedRideDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find booked ride details`,
      });
    }
    return res.status(200).json({
      success: true,
      data: bookedRideDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Send book request handler function
exports.sendBookRequest = async (req, res) => {
  try {
    const id = req.user.id;
    const { rideId } = req.body;

    const user = await User.findById(id);
    const ride = await Ride.findById(rideId);

    // Check if the ride exists
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Add the user to the pendingPassengers array of the ride
    const rideDetails = await Ride.findByIdAndUpdate(
      rideId,
      { $push: { pendingPassengers: user.additionalDetails } },
      { new: true }
    )
      .populate("pendingPassengers")
      .populate("confirmedPassengers");

    const bookedRide = await BookedRide.findOneAndUpdate(
      { _id: user.rideBooked },
      {
        $set: {
          ride: rideId,
          profile: ride.profile,
          rideStatus: "Requested",
        },
      },
      { new: true }
    )
      .populate("ride")
      .populate("profile");

    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .populate({
        path: "ridePublished",
        populate: [
          { path: "pendingPassengers" },
          { path: "confirmedPassengers" },
        ],
      })
      .populate({
        path: "rideBooked",
        populate: [{ path: "profile" }, { path: "ride" }],
      })
      .exec();

    return res.status(200).json({
      updatedUserDetails,
      success: true,
      message: "Book request sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//confirm the booking handler function
exports.confirmBooking = async (req, res) => {
  try {
    const id = req.user.id;
    const passId = req.body.passId;

    // Find the ride id
    const userDetails = await User.findById(id);
    const ride = await Ride.findById(userDetails.ridePublished);
    const profile = await Profile.findById(passId);

    const rideDetails = await Ride.findByIdAndUpdate(
      ride,
      {
        $push: { confirmedPassengers: passId },
        $pull: { pendingPassengers: passId },
      },
      { new: true }
    )
      .populate("pendingPassengers")
      .populate("confirmedPassengers");

    const passEmail = profile.email;

    const bookedRide = await BookedRide.findOneAndUpdate(
      { email: passEmail },
      {
        $set: {
          rideStatus: "Confirmed",
        },
      },
      { new: true }
    )
      .populate("ride")
      .populate("profile");

    return res.status(200).json({
      rideDetails,
      bookedRide,
      success: true,
      message: "Booking Confirmed!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
