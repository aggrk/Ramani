import axios from "axios";
import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/appError.js";
import Checkout from "../models/checkoutModel.js";

async function getAzamPayToken() {
  const tokenUrl = `${process.env.AZAM_PAY_TOKEN_URL}/AppRegistration/GenerateToken`;
  const appName = process.env.AZAM_PAY_APP_NAME;
  const clientId = process.env.AZAM_PAY_CLIENT_ID;
  const clientSecret = process.env.AZAM_PAY_SECRET_KEY;

  if (!appName || !clientId || !clientSecret || !tokenUrl) {
    throw new CustomError(
      "Missing required environment variables for token generation",
      500
    );
  }

  try {
    const response = await axios.post(
      tokenUrl,
      {
        appName,
        clientId,
        clientSecret,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (
      !response.data ||
      !response.data.data ||
      !response.data.data.accessToken
    ) {
      throw new CustomError(
        "Invalid token response: " + JSON.stringify(response.data),
        400
      );
    }

    return response.data.data.accessToken;
  } catch (error) {
    console.error(
      "Error fetching AzamPay token:",
      error.response?.data || error.message
    );
    throw new CustomError(
      error.response?.data?.message || "Failed to fetch AzamPay token",
      error.response?.status || 500
    );
  }
}

export const initiateAzamPayPayment = async ({
  accountNumber,
  amount,
  currency,
  provider,
  reference,
  externalId,
}) => {
  if (
    !accountNumber ||
    !amount ||
    !currency ||
    !provider ||
    !reference ||
    !externalId
  ) {
    throw new CustomError("Missing required fields", 400);
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new CustomError("Amount must be a positive number", 400);
  }
  const validCurrencies = ["TZS", "USD"]; // Adjust based on API docs
  if (!validCurrencies.includes(currency)) {
    throw new CustomError("Invalid currency", 400);
  }

  const CLIENT_ID = process.env.AZAM_PAY_CLIENT_ID;
  const SECRET_KEY = process.env.AZAM_PAY_SECRET_KEY;
  const url = `${process.env.AZAM_PAY_API_URL}/azampay/mno/checkout`;
  if (!CLIENT_ID || !SECRET_KEY || !url) {
    throw new CustomError(
      "Missing required environment variables for AzamPay API",
      500
    );
  }
  const BEARER_TOKEN = await getAzamPayToken();

  const payload = {
    accountNumber,
    amount,
    currency,
    externalId,
    provider,
    reference,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-API-Key": CLIENT_ID,
        "X-API-Secret": SECRET_KEY,
      },
    });

    if (!response.data || !response.data.success) {
      throw new CustomError(
        "Payment initiation failed: " + JSON.stringify(response.data),
        400
      );
    }

    console.log("Payment initiated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error initiating payment:",
      error.response?.data || error.message
    );
    throw error.response?.data
      ? new CustomError(
          error.response.data.message || "API request failed",
          error.response.status
        )
      : new CustomError(error.message, 500);
  }
};

export const pay = catchAsync(async (req, res, next) => {
  const { accountNumber, amount, currency, provider, reference, externalId } =
    req.body;
  const requiredFields = [
    "accountNumber",
    "amount",
    "currency",
    "provider",
    "reference",
    "externalId",
  ];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new CustomError(`Missing ${field}`, 400));
    }
  }

  const response = await initiateAzamPayPayment({
    accountNumber,
    amount,
    currency,
    provider,
    reference,
    externalId,
  });

  await Checkout.create({
    userId: req.user._id,
    phone: accountNumber,
    transactionId: response.transactionId,
    provider,
  });

  res.status(200).json({
    status: "success",
    data: {
      transactionId: response.transactionId || response.id,
      message: "Payment initiated successfully",
    },
  });
});
