import React, { useState, useEffect } from "react";
import {
  getBankDetails,
  createBankTransferOrder,
} from "../../services/wiseApi";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

const BankTransferForm = ({
  amount,
  currency,
  planType,
  onSuccess,
  onCancel,
}) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    setLoading(true);
    try {
      // Get bank details
      const detailsRes = await getBankDetails(currency);
      if (detailsRes.success) {
        setBankDetails(detailsRes.data);

        // Create order with reference
        const orderRes = await createBankTransferOrder(
          planType,
          amount,
          currency,
        );
        if (orderRes.success) {
          setOrder(orderRes.data);
        }
      }
    } catch (error) {
      console.error("Error loading bank details:", error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Loading bank details...</div>
      </div>
    );
  }

  if (!bankDetails || !order) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load payment details. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Bank Transfer Instructions</h3>

      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ Important: Include the reference number exactly as shown below.
          Payments without the correct reference cannot be credited
          automatically.
        </p>
      </div>

      {/* Bank Details */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-700">
          Send to this bank account:
        </h4>

        <DetailRow
          label="Amount"
          value={`${amount} ${currency}`}
          onCopy={() => copyToClipboard(`${amount} ${currency}`, "amount")}
          copied={copied === "amount"}
        />

        <DetailRow
          label="Reference Number"
          value={order.reference}
          onCopy={() => copyToClipboard(order.reference, "reference")}
          copied={copied === "reference"}
          highlight={true}
        />

        <DetailRow
          label="Bank Name"
          value={bankDetails.bankName || "Wise"}
          onCopy={() =>
            copyToClipboard(bankDetails.bankName || "Wise", "bankName")
          }
          copied={copied === "bankName"}
        />

        {bankDetails.accountNumber && (
          <DetailRow
            label="Account Number"
            value={bankDetails.accountNumber}
            onCopy={() =>
              copyToClipboard(bankDetails.accountNumber, "accountNumber")
            }
            copied={copied === "accountNumber"}
          />
        )}

        {bankDetails.sortCode && (
          <DetailRow
            label="Sort Code / Routing"
            value={bankDetails.sortCode}
            onCopy={() => copyToClipboard(bankDetails.sortCode, "sortCode")}
            copied={copied === "sortCode"}
          />
        )}

        {bankDetails.iban && (
          <DetailRow
            label="IBAN"
            value={bankDetails.iban}
            onCopy={() => copyToClipboard(bankDetails.iban, "iban")}
            copied={copied === "iban"}
          />
        )}

        {bankDetails.swift && (
          <DetailRow
            label="SWIFT / BIC"
            value={bankDetails.swift}
            onCopy={() => copyToClipboard(bankDetails.swift, "swift")}
            copied={copied === "swift"}
          />
        )}
      </div>

      {/* Instructions */}
      <div className="border-t pt-4 mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">How to complete:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Log into your bank account</li>
          <li>Create a new bank transfer</li>
          <li>Enter the bank details above</li>
          <li>
            Enter the exact amount: {amount} {currency}
          </li>
          <li>
            <strong>CRITICAL:</strong> Enter the reference number exactly as
            shown
          </li>
          <li>Send the payment</li>
          <li>It takes 1-2 business days to reflect</li>
        </ol>
      </div>

      {/* Payment tracker */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Payment Status:</h4>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-sm">
            Waiting for payment... (Order ID: {order.orderId})
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          We will send you an email when your payment is confirmed.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Print Instructions
        </button>
      </div>
    </div>
  );
};

// Helper component for each detail row
const DetailRow = ({ label, value, onCopy, copied, highlight }) => (
  <div
    className={`flex justify-between items-center p-2 rounded ${highlight ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"}`}
  >
    <span className="text-sm text-gray-600 w-1/3">{label}:</span>
    <span
      className={`text-sm font-mono w-1/2 ${highlight ? "font-bold text-red-600" : ""}`}
    >
      {value}
    </span>
    <button
      onClick={onCopy}
      className="p-1 text-gray-400 hover:text-gray-600"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-green-500" />
      ) : (
        <ClipboardIcon className="h-4 w-4" />
      )}
    </button>
  </div>
);

export default BankTransferForm;
