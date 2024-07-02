const User = require("../models/User");
const Profile = require("../models/Profile");
const Ride = require("../models/Ride");
const BookedRide = require("../models/BookedRide");
const Inbox = require("../models/Inbox");
const mailSender = require("../utils/mailSender");
const { confirmBookingMail } = require("../mail/templates/confirmBookingMail");
const {
  sendBookRequestMail,
} = require("../mail/templates/sendBookRequestMail");
const {
  cancelBookedRideMailToDriver,
} = require("../mail/templates/cancelBookedRideMailToDriver");
const {
  cancelBookedRideMailToUser,
} = require("../mail/templates/cancelBookedRideMailToUser");
const {
  cancelUserBookingMail,
} = require("../mail/templates/cancelUserBookingMail");
const { deleteRideMail } = require("../mail/templates/deleteRideMail");

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
      .populate("inbox")
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

    // Split by comma or space and trim any surrounding spaces
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

//Delete Ride handler function
exports.deleteRide = async (req, res) => {
  try {
    const id = req.user.id;

    // Find the ride id
    const userDetails = await User.findById(id).populate("additionalDetails");
    const ride = await Ride.findById(userDetails.ridePublished);

    const pendingPassIds = ride.pendingPassengers.map(
      (passenger) => passenger._id
    );

    const pendingPassengerProfiles = await Profile.find({
      _id: { $in: pendingPassIds },
    });

    const pendingEmails = pendingPassengerProfiles.map(
      (profile) => profile.email
    );

    const confirmPassId = ride.confirmedPassengers.map(
      (passenger) => passenger._id
    );

    const confirmPassengerProfiles = await Profile.find({
      _id: { $in: confirmPassId },
    });

    const confirmEmails = confirmPassengerProfiles.map(
      (profile) => profile.email
    );

    const bookedRideProfiles = await BookedRide.find({
      $or: [
        { email: { $in: pendingEmails } },
        { email: { $in: confirmEmails } },
      ],
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
      .populate("inbox")
      .exec();

    const driverName = userDetails.additionalDetails.firstName;

    //======== Mail Sent =========
    const sendCancellationEmails = async (emails) => {
      const promises = emails.map((email) =>
        mailSender(email, "Ride Cancelled!", deleteRideMail(driverName))
      );
      await Promise.all(promises);
    };

    await sendCancellationEmails(pendingEmails);
    await sendCancellationEmails(confirmEmails);

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

//Automatically delete Ride handler function
exports.autoDeleteRide = async (req, res) => {
  try {
    const id = req.user.id;

    // Find the ride id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);
    const ride = await Ride.findById(userDetails.ridePublished);

    const pendingPassIds = ride.pendingPassengers.map(
      (passenger) => passenger._id
    );

    const pendingPassengerProfiles = await Profile.find({
      _id: { $in: pendingPassIds },
    });

    const pendingEmails = pendingPassengerProfiles.map(
      (profile) => profile.email
    );

    const confirmPassId = ride.confirmedPassengers.map(
      (passenger) => passenger._id
    );

    const confirmPassengerProfiles = await Profile.find({
      _id: { $in: confirmPassId },
    });

    const confirmEmails = confirmPassengerProfiles.map(
      (profile) => profile.email
    );

    const bookedRideProfiles = await BookedRide.find({
      $or: [
        { email: { $in: pendingEmails } },
        { email: { $in: confirmEmails } },
      ],
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

//Send book request handler function
exports.sendBookRequest = async (req, res) => {
  try {
    const id = req.user.id;
    const { rideId } = req.body;

    const user = await User.findById(id).populate("additionalDetails");
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

    const driverEmail = ride.email;

    const sendNotification = await Inbox.findOneAndUpdate(
      { email: driverEmail },
      {
        $push: {
          message: `New ride booking request from ${user.additionalDetails.firstName}`,
        },
      },
      { new: true }
    );

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
      .populate("inbox")
      .exec();

    const passengerName = user.additionalDetails.firstName;

    //======== Mail Sent ========
    await mailSender(
      driverEmail,
      "New Booking Request",
      sendBookRequestMail(passengerName)
    );

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

//Cancel Booked Ride handler function
exports.cancelBookedRide = async (req, res) => {
  try {
    const id = req.user.id;
    const { rideId } = req.body;

    // Find the booked ride id
    const userDetails = await User.findById(id).populate("additionalDetails");
    const bookedRide = await BookedRide.findById(userDetails.rideBooked);

    bookedRide.profile = null;
    bookedRide.ride = null;
    bookedRide.rideStatus = "";

    await bookedRide.save();

    const ride = await Ride.findById(rideId);

    const update = {
      $pull: {
        pendingPassengers: userDetails.additionalDetails._id,
        confirmedPassengers: userDetails.additionalDetails._id,
      },
    };

    // Check if the user is in pending or confirmed passengers
    if (ride && ride.pendingPassengers && ride.confirmedPassengers) {
      const isInPendingPassengers = ride.pendingPassengers.includes(
        userDetails.additionalDetails._id
      );
      const isInConfirmedPassengers = ride.confirmedPassengers.includes(
        userDetails.additionalDetails._id
      );

      // Increment noOfSeats only if the user is in confirmed passengers
      if (isInConfirmedPassengers && !isInPendingPassengers) {
        update.$inc = { noOfSeats: 1 };
      }
    } else {
      console.error("Ride object or its properties are null or undefined");
    }

    const updatedRide = await Ride.findOneAndUpdate({ _id: rideId }, update, {
      new: true,
    })
      .populate("profile")
      .populate("pendingPassengers")
      .populate("confirmedPassengers");

    const driverEmail = ride.email;
    const passengerName = userDetails.additionalDetails.firstName;

    const sendNotification = await Inbox.findOneAndUpdate(
      { email: driverEmail },
      {
        $push: {
          message: `${passengerName} withdrew their booking request.`,
        },
      },
      { new: true }
    );

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
      .populate("inbox")
      .exec();

    //======== Mail Sent ========
    await mailSender(
      userDetails.email,
      "Booking Request Cancelled",
      cancelBookedRideMailToUser()
    );

    await mailSender(
      driverEmail,
      "Passenger Withdrew Their Request",
      cancelBookedRideMailToDriver(passengerName)
    );

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

//confirm the booking handler function
exports.confirmBooking = async (req, res) => {
  try {
    const id = req.user.id;
    const passId = req.body.passId;

    // Find the ride id
    const userDetails = await User.findById(id).populate("additionalDetails");
    const ride = await Ride.findById(userDetails.ridePublished);
    const profile = await Profile.findById(passId);

    const rideDetails = await Ride.findByIdAndUpdate(
      ride,
      {
        $push: { confirmedPassengers: passId },
        $pull: { pendingPassengers: passId },
        $inc: { noOfSeats: -1 },
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

    const driverName = userDetails.additionalDetails.firstName;

    const sendNotification = await Inbox.findOneAndUpdate(
      { email: passEmail },
      {
        $push: {
          message: `${driverName} has accepted your booking request`,
        },
      },
      { new: true }
    );

    const driverNumber = userDetails.additionalDetails.contactNumber;

    //======== Mail Sent =========
    await mailSender(
      passEmail,
      "Booking Request Accepted!",
      confirmBookingMail(driverName, driverNumber)
    );

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

//cancel the booking handler function
exports.cancelPendingBooking = async (req, res) => {
  try {
    const id = req.user.id;
    const passId = req.body.passId;

    // Find the ride id
    const userDetails = await User.findById(id).populate("additionalDetails");
    const ride = await Ride.findById(userDetails.ridePublished);
    const profile = await Profile.findById(passId);

    const rideDetails = await Ride.findByIdAndUpdate(
      ride,
      {
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
          profile: null,
          ride: null,
          rideStatus: "",
        },
      },
      { new: true }
    )
      .populate("ride")
      .populate("profile");

    const driverName = userDetails.additionalDetails.firstName;

    const sendNotification = await Inbox.findOneAndUpdate(
      { email: passEmail },
      {
        $push: {
          message: `${driverName} has declined your booking request`,
        },
      },
      { new: true }
    );

    //======== Mail Sent =========
    await mailSender(
      passEmail,
      "Booking Request Declined!",
      cancelUserBookingMail(driverName)
    );

    return res.status(200).json({
      rideDetails,
      bookedRide,
      success: true,
      message: "Booking Cancelled!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//cancel the confirmed booking handler function
exports.cancelConfirmedBooking = async (req, res) => {
  try {
    const id = req.user.id;
    const passId = req.body.passId;

    // Find the ride id
    const userDetails = await User.findById(id).populate("additionalDetails");
    const ride = await Ride.findById(userDetails.ridePublished);
    const profile = await Profile.findById(passId);

    const rideDetails = await Ride.findByIdAndUpdate(
      ride,
      {
        $pull: { confirmedPassengers: passId },
        $inc: { noOfSeats: 1 },
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
          profile: null,
          ride: null,
          rideStatus: "",
        },
      },
      { new: true }
    )
      .populate("ride")
      .populate("profile");

    const driverName = userDetails.additionalDetails.firstName;

    const sendNotification = await Inbox.findOneAndUpdate(
      { email: passEmail },
      {
        $push: {
          message: `${driverName} has declined your booking request`,
        },
      },
      { new: true }
    );

    //======== Mail Sent =========
    await mailSender(
      passEmail,
      "Booking Request Declined!",
      cancelUserBookingMail(driverName)
    );

    return res.status(200).json({
      rideDetails,
      bookedRide,
      success: true,
      message: "Booking Cancelled!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
