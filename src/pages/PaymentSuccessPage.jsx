import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPayment } from "../api/paymentService";

export function PaymentSuccessPage() {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    useEffect(() => {
        const confirm = async () => {
            try {
                await confirmPayment({
                    paymentKey,
                    orderId,
                    amount
                });
                setIsConfirmed(true);
            } catch (err) {
                alert('Payment confirmation failed.');
                console.error(err);
                navigate("/payment/fail?message=Confirmation Failed");
            }
        };

        if (paymentKey && orderId && amount) {
            confirm();
        }
    }, [paymentKey, orderId, amount, navigate]);

    return (
        <div className="wrapper w-100" style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
            {isConfirmed ? (
                <div className="flex-column align-center confirm-success w-100">
                    <img
                        src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
                        width="120"
                        height="120"
                        alt="Success"
                    />
                    <h2 className="title">Payment Completed!</h2>
                    <div className="response-section w-100" style={{ margin: "20px 0", textAlign: "left", padding: "20px", background: "#f9f9f9" }}>
                        <div className="flex justify-between" style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                            <span className="response-label">Amount</span>
                            <span className="response-text">{Number(amount).toLocaleString()} Won</span>
                        </div>
                        <div className="flex justify-between" style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                            <span className="response-label">Order ID</span>
                            <span className="response-text">{orderId}</span>
                        </div>
                        <div className="flex justify-between" style={{ display: "flex", justifyContent: "space-between" }}>
                            <span className="response-label">Payment Key</span>
                            <span className="response-text" style={{ fontSize: "12px" }}>{paymentKey}</span>
                        </div>
                    </div>

                    <div className="w-100 button-group">
                        <button
                            onClick={() => navigate('/')}
                            style={{ padding: "10px 20px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-column align-center confirm-loading w-100">
                    <div className="flex-column align-center">
                        <img
                            src="https://static.toss.im/lotties/loading-spot-apng.png"
                            width="120"
                            height="120"
                            alt="Loading"
                        />
                        <h2 className="title text-center">Processing Payment...</h2>
                        <h4 className="text-center description">Please wait while we confirm your payment.</h4>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentSuccessPage;
