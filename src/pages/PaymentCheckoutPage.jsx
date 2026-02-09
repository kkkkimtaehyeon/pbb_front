import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import "./PaymentCheckoutPage.css";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export function PaymentCheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, amount, customerName, customerEmail, orderName } = location.state || {};

    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);
    const paymentMethodWidgetRef = useRef(null);



    useEffect(() => {
        if (!orderId || !amount) {
            alert("Invalid payment request.");
            navigate("/");
            return;
        }

        async function fetchPaymentWidgets() {
            const tossPayments = await loadTossPayments(clientKey);
            const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
            setWidgets(widgets);
        }

        fetchPaymentWidgets();
    }, [orderId, amount, navigate]);

    useEffect(() => {
        async function renderPaymentWidgets() {
            if (widgets == null) {
                return;
            }

            await widgets.setAmount({
                currency: "KRW",
                value: amount,
            });

            const [paymentMethodWidget] = await Promise.all([
                widgets.renderPaymentMethods({
                    selector: "#payment-method",
                    variantKey: "DEFAULT",
                }),
                widgets.renderAgreement({
                    selector: "#agreement",
                    variantKey: "AGREEMENT",
                }),
            ]);

            paymentMethodWidgetRef.current = paymentMethodWidget;
            setReady(true);
        }

        renderPaymentWidgets();
    }, [widgets, amount]);

    return (
        <div className="wrapper w-100" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <div className="max-w-540 w-100">
                {/* Delivery Information Section */}
                <div id="payment-method" className="w-100" />
                <div id="agreement" className="w-100" />
                <div className="btn-wrapper w-100" style={{ marginTop: "20px", textAlign: "center" }}>
                    <button
                        className="btn primary w-100"
                        style={{
                            padding: "15px 30px",
                            backgroundColor: "#0078ff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                        onClick={async () => {
                            console.log("Payment button clicked");
                            if (!widgets) {
                                alert("Payment widgets are not ready yet.");
                                return;
                            }

                            try {
                                const selectedPaymentMethod = await paymentMethodWidgetRef.current?.getSelectedPaymentMethod();
                                console.log("Selected Payment Method:", selectedPaymentMethod);
                                console.log("Requesting payment with Order ID:", orderId, "Type:", typeof orderId);

                                await widgets.requestPayment({
                                    orderId: String(orderId),
                                    orderName: orderName || "Book Order",
                                    customerName: customerName || "Guest",
                                    customerEmail: customerEmail || "customer@example.com",
                                    successUrl: window.location.origin + "/payment/success",
                                    failUrl: window.location.origin + "/payment/fail"
                                });
                            } catch (error) {
                                console.error("Payment Request Error:", error);
                                alert(`Payment Request Failed: ${error.message || error}`);
                            }
                        }}
                    >
                        {amount?.toLocaleString()}원 결제하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentCheckoutPage;
