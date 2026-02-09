import React, { useState } from 'react';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, onSubmit, orderId }) => {
    const [star, setStar] = useState(5);
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        const formData = new FormData();
        const requestData = {
            orderId: orderId, // Assuming backend needs to link review to order or product from order
            content: content,
            star: star
        };

        // This structure depends on how backend expects mixed data. 
        // User said: multipart files, data: {content: "", star: 0}
        // Usually Spring expects 'request' part as JSON string and 'files' part.
        // Let's try appending 'request' as JSON blob and 'files'.

        // However, standard multipart often just fields. 
        // "data: {content: "", star: 0}" suggests a nested object or a JSON string field named 'data'.
        // Let's assume 'data' is a JSON string based on typical "Part" behavior or just fields if @ModelAttribute.
        // Given description "data: {content...}", I'll append a JSON blob named 'data'.

        const jsonBlob = new Blob([JSON.stringify(requestData)], { type: "application/json" });
        formData.append("data", jsonBlob);

        Array.from(files).forEach(file => {
            formData.append("files", file);
        });

        onSubmit(formData);
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>리뷰 작성</h3>
                <div className="form-group">
                    <label>별점</label>
                    <select value={star} onChange={(e) => setStar(Number(e.target.value))}>
                        <option value="5">★★★★★</option>
                        <option value="4">★★★★</option>
                        <option value="3">★★★</option>
                        <option value="2">★★</option>
                        <option value="1">★</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="5"
                        placeholder="리뷰 내용을 입력해주세요."
                    />
                </div>
                <div className="form-group">
                    <label>사진 첨부</label>
                    <input type="file" multiple onChange={handleFileChange} />
                </div>
                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                    <button className="submit-btn" onClick={handleSubmit}>등록</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
