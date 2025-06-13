import React, { useState, useEffect } from 'react';
import { getDocs, collection, addDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase'; // Importa a autenticação para pegar o usuário atual

const CommentsSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchComments = async () => {
      const commentsCollection = collection(db, 'tasks', taskId, 'comments');
      const commentsQuery = query(commentsCollection, orderBy('timestamp', 'asc'));
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsList = commentsSnapshot.docs.map((doc) => doc.data());
      setComments(commentsList);
    };

    fetchComments();
  }, [taskId]);

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;

    const commentData = {
      content: newComment,
      author: currentUser ? currentUser.email : 'Anônimo',
      timestamp: new Date(),
    };

    await addDoc(collection(db, 'tasks', taskId, 'comments'), commentData);

    setComments([...comments, commentData]);
    setNewComment('');
  };

  return (
    <div style={styles.commentSection}>
      <div style={styles.commentsList}>
        {comments.map((comment, index) => (
          <div key={index} style={styles.commentItem}>
            <div style={styles.commentHeader}>
              <div style={styles.commentAuthor}>
                <span style={styles.authorIcon}></span>
                <strong>{comment.author}</strong>
              </div>
              <span style={styles.commentTimestamp}>
                {new Date(comment.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p style={styles.commentContent}>{comment.content}</p>
          </div>
        ))}
      </div>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Adicione um comentário..."
        style={styles.textarea}
      />
      <div style={styles.commentActions}>
        <button onClick={handleAddComment} style={styles.commentButton}>
          Enviar
        </button>
      </div>
    </div>
  );
};

const styles = {
  commentSection: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    backgroundColor: '#ede9dd',
    borderRadius: '15px',
    boxSizing: 'border-box',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  commentItem: {
    padding: '15px',
    borderRadius: '10px',
    backgroundColor: '#ede9dd',
    color: '#000',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  authorIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#ff4d6d',
  },
  commentTimestamp: {
    fontSize: '12px',
    color: '#888',
  },
  commentContent: {
    fontSize: '14px',
    marginTop: '5px',
  },
  textareaContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#ede9dd',
    borderRadius: '10px',
  },
  textarea: {
    flex: 1,
    minHeight: '80px',
    padding: '10px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#fff',
    fontSize: '14px',
    color: '#000',
    resize: 'none',
  },
  commentButton: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#ff4d6d',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginLeft: '10px',
  },
};

export default CommentsSection;
