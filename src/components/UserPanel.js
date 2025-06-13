import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const UserPanel = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || 'Usuário');
  const [photoURL, setPhotoURL] = useState(user.photoURL || 'https://via.placeholder.com/150');
  const [newPhoto, setNewPhoto] = useState(null); // To store new photo file
  const [previewPhoto, setPreviewPhoto] = useState(null); // For photo preview
  const [isSaving, setIsSaving] = useState(false); // Indicates save in progress

  const handleSaveChanges = async () => {
    setIsSaving(true); // Start saving state
    try {
      let photoURLUpdated = photoURL;

      // Upload new profile photo if provided
      if (newPhoto) {
        const storageRef = ref(storage, `profiles/${user.uid}_${newPhoto.name}`);
        const uploadTask = uploadBytesResumable(storageRef, newPhoto);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error), // Reject promise if there's an error
            async () => {
              photoURLUpdated = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      // Update user profile in Firebase Auth
      await updateProfile(user, {
        displayName,
        photoURL: photoURLUpdated,
      });

      // Update local state
      setPhotoURL(photoURLUpdated);
      setIsEditing(false);
      setPreviewPhoto(null);
    } catch (error) {
      console.error('Erro ao atualizar perfil: ', error);
      alert('Ocorreu um erro ao salvar as alterações. Tente novamente.');
    } finally {
      setIsSaving(false); // End saving state
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      setPreviewPhoto(URL.createObjectURL(file)); // Set preview image
    }
  };

  return (
    <div style={styles.panel}>
      {isEditing ? (
        <>
          {/* Photo preview or existing photo */}
          {previewPhoto ? (
            <img src={previewPhoto} alt="Preview" style={styles.avatar} />
          ) : (
            <img src={photoURL} alt="User Avatar" style={styles.avatar} />
          )}
          <input
            type="file"
            onChange={handlePhotoChange}
            style={styles.inputFile}
            accept="image/*" // Accept only images
          />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={styles.inputText}
          />
          <button
            onClick={handleSaveChanges}
            style={styles.saveButton}
            disabled={isSaving} // Disable button while saving
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </>
      ) : (
        <>
          <img src={photoURL} alt="User Avatar" style={styles.avatar} />
          <h3 style={styles.textWhite}>{displayName}</h3>
          <p style={styles.texto}>{user.email}</p>
          <button
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
            onClick={() => setIsEditing(true)}
            style={styles.editButton}
          >
            PERFIL
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  texto: {
    color: '#fff', // White text color for display name and email
    margin: '10px 0',
    fontSize: '15px',
  },
  panel: {
    backgroundColor: 'rgba(255, 128, 147, 0.25)', // Background with 25% opacity
    padding: '20px',
    borderRadius: '15px', // Rounded corners
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
    maxWidth: '400px',
    height: '300px',
    marginTop: '30px',
    border: '2px solid rgba(255, 128, 147, 0.5)', // Semi-transparent border
  },
  avatar: {
    borderRadius: '50%',
    marginBottom: '10px',
    width: '130px',
    height: '130px',
  },
  inputFile: {
    marginBottom: '15px',
  },
  inputText: {
    marginBottom: '15px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
  },
  textWhite: {
    color: '#fff', // White text color for display name and email
    margin: '10px 0',
    fontSize: '40px',
  },
  editButton: {
    padding: '10px 15px',
    backgroundColor: '#fff', // White background for the button
    color: '#000', // Black text for contrast
    border: 'none',
    borderRadius: '15px', // Rounded edges
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '20px',
   
    width: '100px',
    height: '40px',
    marginTop: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Subtle shadow
    textTransform: 'capitalize',
  },
  saveButton: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default UserPanel;
