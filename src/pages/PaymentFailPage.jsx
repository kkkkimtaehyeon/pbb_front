import { useSearchParams, useNavigate } from "react-router-dom";

export function PaymentFailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const errorCode = searchParams.get("code");
    const errorMessage = searchParams.get("message");

    return (
        <div className="wrapper w-100" style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <div className="flex-column align-center w-100">
                <img
                    src="https://static.toss.im/lotties/error-spot-apng.png"
                    width="120"
                    height="120"
                    alt="Error"
                />
                <h2 className="title">Payment Failed</h2>
                <div className="response-section w-100" style={{ margin: "20px 0", textAlign: "left", padding: "20px", background: "#fff5f5" }}>
                    <div className="flex justify-between" style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span className="response-label">Error Code</span>
                        <span className="response-text" style={{ color: "red" }}>{errorCode}</span>
                    </div>
                    <div className="flex justify-between" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="response-label">Message</span>
                        <span className="response-text">{errorMessage}</span>
                    </div>
                </div>

                <div className="w-100 button-group">
                    <button
                        onClick={() => navigate('/cart')}
                        style={{ padding: "10px 20px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                        Back to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentFailPage;
