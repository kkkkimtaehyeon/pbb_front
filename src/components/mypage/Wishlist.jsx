import { useState, useEffect } from 'react';
import { getWishlist } from '../../api/userService';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const data = await getWishlist();
            setWishlist(data);
        } catch (error) {
            console.error(error);
            // Mock data fallback
            setWishlist([
                { id: 101, title: 'Clean Code', author: 'Uncle Bob', price: 30000 },
                { id: 102, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 35000 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 className="mypage-section-title">My Wishlist</h3>
            <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {wishlist.map(book => (
                    <div key={book.id} className="book-card" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                        <h4>{book.title}</h4>
                        <p>{book.author}</p>
                        <p>{book.price.toLocaleString()} KRW</p>
                        <button style={{ width: '100%', padding: '5px', marginTop: '10px', background: '#333', color: '#fff', border: 'none' }}>Add to Cart</button>
                    </div>
                ))}
            </div>
            {(!loading && wishlist.length === 0) && <p>Your wishlist is empty.</p>}
        </div>
    );
};

export default Wishlist;
