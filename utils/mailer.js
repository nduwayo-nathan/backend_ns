// utils/mailer.js
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendApprovalEmail = async (to, slotNumber, plateNumber, timestamp) => {
  try {
    await transporter.sendMail({
      from: `"🚗 VehicleReg Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: "✅ Slot Request Approved",
      html: `
        <h2>🎉 Slot Approval Confirmation</h2>
        <p>Your parking slot request has been <strong>approved</strong>.</p>
        <ul>
          <li><strong>🅿️ Slot Number:</strong> ${slotNumber}</li>
          <li><strong>🚗 Vehicle Plate:</strong> ${plateNumber}</li>
          <li><strong>⏰ Approved At:</strong> ${new Date(timestamp).toLocaleString()}</li>
        </ul>
        <p>Thank you for using VehicleReg!</p>
      `,
      text: `Your slot request is approved. Slot: ${slotNumber}, Vehicle: ${plateNumber}, Time: ${new Date(timestamp).toLocaleString()}`,
    });
  } catch (error) {
    console.error("Failed to send approval email:", error);
  }
};

