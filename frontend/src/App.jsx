import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const plans = {
  basic: { name: "Basic", price: 5, currency: "USD" },
  gold: { name: "Gold", price: 10, currency: "USD" },
  premium: { name: "Premium", price: 15, currency: "USD" },
};

function App() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handlePlanSelect = (planKey) => {
    const plan = plans[planKey];
    setSelectedPlan(plan);
    setSelectedMethod(null);
    setShowDetails(false);
  };

  const handlePaymentMethodSelect = async (method) => {
    setSelectedMethod(method);

    // Only Bank Transfer works
    if (method === "bank") {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/bank-details`, {
          params: {
            currency: selectedPlan.currency,
            amount: selectedPlan.price,
          },
        });

        if (response.data.success) {
          setBankDetails(response.data.data);
          setShowDetails(true);
        }
      } catch (error) {
        alert("Failed to load bank details. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Stripe and Wise Account - Coming soon
      alert(
        `${method === "stripe" ? "Credit/Debit Card" : "Pay with Wise Account"} is coming soon! Please use Bank Transfer for now.`,
      );
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const goBackToPayment = () => {
    setShowDetails(false);
    setSelectedMethod(null);
  };

  // Show bank details after selecting Bank Transfer
  if (showDetails && bankDetails) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f4f6",
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <button
            onClick={goBackToPayment}
            style={{
              marginBottom: "16px",
              color: "#BD1105",
              cursor: "pointer",
              background: "none",
              width: "600px",
              border: "none",
              height: "200px",
            }}
          >
            ← Back to Payment Options
          </button>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Bank Transfer Instructions
            </h2>

            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
              }}
            >
              <p style={{ color: "#92400e" }}>
                ⚠️ Send exactly{" "}
                <strong>
                  ${selectedPlan.price} {selectedPlan.currency}
                </strong>{" "}
                and include the reference number
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  marginBottom: "8px",
                  borderRadius: "4px",
                }}
              >
                <strong>Amount:</strong>{" "}
                <span>
                  ${selectedPlan.price} {selectedPlan.currency}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${selectedPlan.price} ${selectedPlan.currency}`,
                    )
                  }
                  style={{ color: "#3b82f6", cursor: "pointer" }}
                >
                  Copy
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  backgroundColor: "#fef3c7",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  border: "1px solid #fcd34d",
                }}
              >
                <strong>Reference:</strong>{" "}
                <span style={{ fontFamily: "monospace", color: "#dc2626" }}>
                  {bankDetails.reference}
                </span>
                <button
                  onClick={() => copyToClipboard(bankDetails.reference)}
                  style={{ color: "#3b82f6", cursor: "pointer" }}
                >
                  Copy
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  marginBottom: "8px",
                  borderRadius: "4px",
                }}
              >
                <strong>Bank Name:</strong> <span>{bankDetails.bankName}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  marginBottom: "8px",
                  borderRadius: "4px",
                }}
              >
                <strong>Account Number:</strong>{" "}
                <span>{bankDetails.accountNumber}</span>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountNumber)}
                  style={{ color: "#3b82f6", cursor: "pointer" }}
                >
                  Copy
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  marginBottom: "8px",
                  borderRadius: "4px",
                }}
              >
                <strong>Sort Code:</strong> <span>{bankDetails.sortCode}</span>
                <button
                  onClick={() => copyToClipboard(bankDetails.sortCode)}
                  style={{ color: "#3b82f6", cursor: "pointer" }}
                >
                  Copy
                </button>
              </div>

              {bankDetails.iban && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    marginBottom: "8px",
                    borderRadius: "4px",
                  }}
                >
                  <strong>IBAN:</strong>{" "}
                  <span style={{ fontSize: "12px" }}>{bankDetails.iban}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.iban)}
                    style={{ color: "#3b82f6", cursor: "pointer" }}
                  >
                    Copy
                  </button>
                </div>
              )}

              {bankDetails.swift && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    marginBottom: "8px",
                    borderRadius: "4px",
                  }}
                >
                  <strong>SWIFT:</strong> <span>{bankDetails.swift}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.swift)}
                    style={{ color: "#3b82f6", cursor: "pointer" }}
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
              <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
                How to complete:
              </h3>
              <ol
                style={{
                  listStyleType: "decimal",
                  paddingLeft: "20px",
                  fontSize: "14px",
                  color: "#4b5563",
                }}
              >
                <li>Log into your bank account</li>
                <li>Create a new bank transfer</li>
                <li>Enter the bank details above</li>
                <li>
                  Enter exactly ${selectedPlan.price} {selectedPlan.currency}
                </li>
                <li>
                  <strong>CRITICAL:</strong> Enter the reference number exactly
                </li>
                <li>Send the payment (takes 1-2 days)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show payment method selection after plan is selected
  if (selectedPlan && !showDetails) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f4f6",
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <button
            onClick={() => setSelectedPlan(null)}
            style={{
              marginBottom: "16px",
              color: "#4b5563",
              cursor: "pointer",
              background: "none",
              border: "none",
            }}
          >
            ← Back to Plans
          </button>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Selected Plan: {selectedPlan.name}
            </h2>
            <p
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#4f46e5",
                marginBottom: "24px",
              }}
            >
              ${selectedPlan.price} {selectedPlan.currency}
            </p>

            <h3 style={{ fontWeight: "600", marginBottom: "16px" }}>
              Choose Payment Method:
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {/* Option 1: Stripe - Coming Soon */}
              <button
                onClick={() => handlePaymentMethodSelect("stripe")}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "left",
                  backgroundColor: "white",
                  cursor: "pointer",
                  opacity: 0.6,
                }}
              >
                <span style={{ fontSize: "28px" }}>💳</span>
                <div>
                  <p style={{ fontWeight: "600" }}>Credit / Debit Card</p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    Powered by Stripe • Instant access
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#f59e0b",
                      marginTop: "4px",
                    }}
                  >
                    ⚠️ Coming soon
                  </p>
                </div>
              </button>

              {/* Option 2: Bank Transfer (Wise) - WORKING */}
              <button
                onClick={() => handlePaymentMethodSelect("bank")}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  border: "2px solid #10b981",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "left",
                  backgroundColor: "#ecfdf5",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "28px" }}>🏦</span>
                <div>
                  <p style={{ fontWeight: "600", color: "#065f46" }}>
                    Bank Transfer (Wise)
                  </p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    Manual transfer • 1-2 business days
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#10b981",
                      marginTop: "4px",
                    }}
                  >
                    ✅ Available now
                  </p>
                </div>
                {loading && selectedMethod === "bank" && (
                  <span style={{ marginLeft: "auto" }}>Loading...</span>
                )}
              </button>

              {/* Option 3: Wise Account - Coming Soon */}
              <button
                onClick={() => handlePaymentMethodSelect("wise")}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "left",
                  backgroundColor: "white",
                  cursor: "pointer",
                  opacity: 0.6,
                }}
              >
                <span style={{ fontSize: "28px" }}>🔄</span>
                <div>
                  <p style={{ fontWeight: "600" }}>Pay with Wise Account</p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    Instant payment • Requires Wise account
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#f59e0b",
                      marginTop: "4px",
                    }}
                  >
                    ⚠️ Coming soon
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show plan cards (initial screen)
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "48px 16px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          Choose Your Resume Plan
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
          }}
        >
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {plan.name}
              </h2>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#4f46e5",
                  marginBottom: "16px",
                }}
              >
                ${plan.price}
              </p>
              <button
                onClick={() => handlePlanSelect(key)}
                style={{
                  width: "100%",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
