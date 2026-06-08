import React, { useState } from "react";
import BankTransferForm from "../components/Payments/BankTransferForm";
import WiseRedirectButton from "../components/Payments/WiseRedirectButton";

const plans = {
  basic: { name: "Basic", price: 5, currency: "USD" },
  gold: { name: "Gold", price: 10, currency: "USD" },
  premium: { name: "Premium", price: 15, currency: "USD" },
};

const Checkout = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(plans[planKey]);
    setPaymentMethod(null);
    setShowBankForm(false);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === "bank") {
      setShowBankForm(true);
    }
  };

  const handleBankSuccess = () => {
    alert("Order created! Please complete the bank transfer.");
    // Optionally redirect to orders page
  };

  const handleBankCancel = () => {
    setShowBankForm(false);
    setPaymentMethod(null);
  };

  // If bank form is showing
  if (showBankForm && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBankCancel}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back to payment options
          </button>
          <BankTransferForm
            amount={selectedPlan.price}
            currency={selectedPlan.currency}
            planType={selectedPlan.name.toLowerCase()}
            onSuccess={handleBankSuccess}
            onCancel={handleBankCancel}
          />
        </div>
      </div>
    );
  }

  // If no plan selected, show plan selection
  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Choose Your Plan
          </h1>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className="bg-white rounded-lg shadow-md p-6 text-center"
              >
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-4xl font-bold text-indigo-600 mb-4">
                  ${plan.price}
                </p>
                <button
                  onClick={() => handlePlanSelect(key)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show payment methods
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => setSelectedPlan(null)}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          ← Back to plans
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-2">
            Selected Plan: {selectedPlan.name}
          </h2>
          <p className="text-2xl font-bold text-indigo-600 mb-6">
            ${selectedPlan.price} {selectedPlan.currency}
          </p>

          <h3 className="font-semibold mb-3">Choose Payment Method:</h3>

          <div className="space-y-3">
            {/* Stripe Option */}
            <button
              onClick={() => handlePaymentMethodSelect("stripe")}
              className="w-full border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors text-left flex items-center gap-3"
            >
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-semibold">Credit / Debit Card</p>
                <p className="text-sm text-gray-500">
                  Powered by Stripe • Instant access
                </p>
              </div>
            </button>

            {/* Wise Bank Transfer Option */}
            <button
              onClick={() => handlePaymentMethodSelect("bank")}
              className="w-full border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors text-left flex items-center gap-3"
            >
              <span className="text-2xl">🏦</span>
              <div>
                <p className="font-semibold">Bank Transfer (Wise)</p>
                <p className="text-sm text-gray-500">
                  Manual transfer • 1-2 business days
                </p>
              </div>
            </button>

            {/* Wise Redirect Option */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <WiseRedirectButton
                amount={selectedPlan.price}
                currency={selectedPlan.currency}
                planType={selectedPlan.name.toLowerCase()}
                onStart={() => console.log("Redirecting to Wise...")}
                onError={(err) => console.error("Error:", err)}
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Instant payment • Requires Wise account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
