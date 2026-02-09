import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookDetail } from '../api/bookService';
import { addToCart } from '../api/cartService';
import { getReviews } from '../api/reviewService';
import './BookDetailPage.css';

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [paging, setPaging] = useState({ page: 0, totalPages: 0 });

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const data = await getBookDetail(id);
                setBook(data);

                // Fetch reviews
                const reviewData = await getReviews(0, 5); // Default page 0, size 5
                setReviews(reviewData.content || []);
                setPaging({
                    page: reviewData.pageable?.pageNumber || 0,
                    totalPages: reviewData.totalPages || 0
                });
            } catch (err) {
                setError('Failed to fetch book details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = async () => {
        try {
            await addToCart([{ productId: book.id, quantity }]);
            if (window.confirm('Item added to cart. Go to Cart?')) {
                navigate('/cart');
            }
        } catch (err) {
            alert('Failed to add to cart.');
            console.error(err);
        }
    };

    const handleBuyNow = async () => {
        try {
            const salePrice = book.priceSales || book.price || 0;
            navigate('/order', {
                state: {
                    items: [{
                        productId: book.id,
                        price: salePrice,
                        quantity: quantity,
                        productName: book.title,
                        productImageUrl: book.imageUrl
                    }]
                }
            });
        } catch (err) {
            alert('Failed to process buy now.');
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!book) return <div className="error">Book not found.</div>;

    // Calculate/Mock fields
    const salePrice = book.priceSales || book.price || 0;
    const stdPrice = book.priceStandard || Math.floor(salePrice * 1.1);
    const discount = stdPrice > salePrice
        ? Math.round(((stdPrice - salePrice) / stdPrice) * 100)
        : 0;
    const points = Math.floor(salePrice * 0.05);

    return (
        <div className="detail-container">
            <div className="breadcrumb">
                Domestic Books &gt; Novels/Poetry &gt; Korean Novels
            </div>

            <div className="detail-header">
                <h1>{book.title}</h1>
                <div className="detail-header-meta">
                    {book.authors} (Author) | {book.publisher} | {book.publishDate || '2025-01'}
                </div>
            </div>

            <div className="detail-body">
                <div className="left-col">
                    <div className="img-wrapper">
                        {book.imageUrl ? (
                            <img src={book.imageUrl} alt={book.title} />
                        ) : (
                            <div className="no-image">No Image</div>
                        )}
                        <button className="preview-btn-lg">Preview</button>
                    </div>
                </div>

                <div className="right-col">
                    <div className="price-box">
                        <div className="price-row">
                            <span className="label">정가</span>
                            <span className="value strike">{stdPrice.toLocaleString()} 원</span>
                        </div>
                        <div className="price-row main-price">
                            <span className="label">판매가</span>
                            <span className="value red">{salePrice.toLocaleString()} 원</span>
                            <span className="discount">({discount}% 할인)</span>
                        </div>
                        <div className="price-row">
                            <span className="label local-points">적립</span>
                            <span className="value">{points.toLocaleString()}P (5%)</span>
                        </div>
                    </div>

                    <div className="delivery-info">
                        <div className="info-row">
                            <span className="label">배송</span>
                            <span className="value">무료배송</span>
                        </div>
                        <div className="info-row">
                            <span className="label">예상</span>
                            <span className="value">오늘 주문 시 내일 도착</span>
                        </div>
                    </div>

                    <div className="action-area">
                        <div className="quantity-select">
                            <label>수량</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                min="1"
                            />
                        </div>
                        <div className="btn-group">
                            <button className="cart-btn" onClick={handleAddToCart}>장바구니 담기</button>
                            <button className="buy-btn" onClick={handleBuyNow}>바로 구매</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="book-description-section">
                <h3>책 소개</h3>
                <p className="summary-text">{book.summary || book.description || "No description available."}</p>
            </div>

            <div className="review-section">
                <h3>리뷰 ({reviews.length})</h3>
                {reviews.length === 0 ? (
                    <p className="no-reviews">아직 작성된 리뷰가 없습니다.</p>
                ) : (
                    <div className="review-list">
                        {reviews.map((review, index) => (
                            <div key={index} className="review-item">
                                <div className="review-header">
                                    <span className="reviewer-name">{review.memberName}</span>
                                    <span className="review-star">{'★'.repeat(review.star)}</span>
                                </div>

                                {review.fileUrls && review.fileUrls.length > 0 && (
                                    <div className="review-images">
                                        {review.fileUrls.map((url, i) => (
                                            <img key={i} src={url} alt={`review-img-${i}`} className="review-img" />
                                        ))}
                                    </div>
                                )}
                                <p className="review-content">{review.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookDetailPage;
