import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../Api';
import { 
  User, 
  Camera, 
  Mail, 
  Calendar, 
  UserCircle,
  Edit2,
  Check,
  X,
  Key,
  ArrowLeft,
  Trash2,
  Upload,
  Sparkles,
  Shield
} from 'lucide-react';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editMode, setEditMode] = useState({});
  const [editValues, setEditValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const LoadData = async () => {
    try {
      const res = await api.get("/me");
      setUserData(res.data);
      setEditValues({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        dob: res.data.dob || '',
        gender: res.data.gender || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    LoadData();
  }, []);

  const handleChangeClick = () => fileInputRef.current.click();

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", userData.email);

    try {
      await api.post("/upload", formData);
      setUserData({ ...userData, imageURL: URL.createObjectURL(file) });
      setShowModal(false);
    } catch {
      setError("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("name", userData.email);

    try {
      await api.post("/remove", formData);
      setUserData({ ...userData, imageURL: null });
      setSelectedFile(null);
      setShowModal(false);
    } catch {
      setError("Error removing image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditToggle = (field) => setEditMode({ ...editMode, [field]: !editMode[field] });
  const handleInputChange = (field, value) => setEditValues({ ...editValues, [field]: value });

  const handleSave = async (field) => {
    setIsSaving(true);
    try {
      let updateData = {};
      if (field === "fullName") {
        updateData = { firstName: editValues.firstName, lastName: editValues.lastName };
      } else {
        updateData = { [field]: editValues[field] };
      }
      await api.post("/update-profile", updateData);
      setUserData({ ...userData, ...updateData });
      setEditMode({ ...editMode, [field]: false });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || `Error updating ${field}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (field) => {
    if (field === "fullName") {
      setEditValues({ ...editValues, firstName: userData.firstName || '', lastName: userData.lastName || '' });
    } else {
      setEditValues({ ...editValues, [field]: userData[field] || '' });
    }
    setEditMode({ ...editMode, [field]: false });
  };

  const renderEditableField = (field, label, icon, type = 'text', options = null) => {
    const isEditing = editMode[field];
    const Icon = icon;
    const isEmpty = !userData[field] || (typeof userData[field] === 'string' && userData[field].trim() === '');

    if (field === "fullName") {
      const displayValue = userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : '';
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <label className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-2">
            <Icon className="w-4 h-4 text-indigo-600" />
            {label}
          </label>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex-grow flex gap-2">
                <input
                  type="text"
                  className="flex-1 border-2 border-gray-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-50"
                  placeholder="First name"
                  value={editValues.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={isSaving}
                />
                <input
                  type="text"
                  className="flex-1 border-2 border-gray-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-50"
                  placeholder="Last name"
                  value={editValues.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={isSaving}
                />
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center"
                  onClick={() => handleSave("fullName")}
                  disabled={isSaving}
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
                </button>
                <button
                  className="border-2 border-gray-300 hover:border-gray-400 text-gray-600 px-3 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
                  onClick={() => handleCancel("fullName")}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className={`flex-grow bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl px-4 py-3 border-2 transition-all ${displayValue ? 'border-gray-200' : 'border-dashed border-gray-300 italic text-gray-400'}`}>
                  {displayValue || `Add ${label}`}
                </div>
                <button
                  className="border-2 border-indigo-500 hover:bg-indigo-50 text-indigo-600 px-3 py-3 rounded-xl text-sm transition-all"
                  onClick={() => handleEditToggle("fullName")}
                  title={displayValue ? "Edit Name" : `Add ${label}`}
                >
                  {displayValue ? <Edit2 className="w-4 h-4" /> : <span className="text-lg font-bold">+</span>}
                </button>
              </>
            )}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <label className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-2">
          <Icon className="w-4 h-4 text-indigo-600" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          {isEditing ? (
            options ? (
              <div className="flex-grow flex gap-2">
                <select
                  className="flex-1 border-2 border-gray-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-50"
                  value={editValues[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  disabled={isSaving}
                >
                  <option value="">Select {label}</option>
                  {options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center" onClick={() => handleSave(field)} disabled={isSaving}>
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
                </button>
                <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-600 px-3 py-2 rounded-xl transition-all disabled:opacity-50" onClick={() => handleCancel(field)} disabled={isSaving}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex-grow flex gap-2">
                <input
                  type={type}
                  className="flex-1 border-2 border-gray-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-50"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={editValues[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  disabled={isSaving}
                />
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center" onClick={() => handleSave(field)} disabled={isSaving}>
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
                </button>
                <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-600 px-3 py-2 rounded-xl transition-all disabled:opacity-50" onClick={() => handleCancel(field)} disabled={isSaving}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          ) : (
            <>
              <div className={`flex-grow bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl px-4 py-3 border-2 transition-all ${isEmpty ? 'border-dashed border-gray-300 italic text-gray-400' : 'border-gray-200'}`}>
                {userData[field] || `Add ${label.toLowerCase()}`}
              </div>
              <button className="border-2 border-indigo-500 hover:bg-indigo-50 text-indigo-600 px-3 py-3 rounded-xl transition-all" onClick={() => handleEditToggle(field)}>
                {isEmpty ? <span className="text-lg font-bold">+</span> : <Edit2 className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center relative overflow-hidden py-12 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">Your Account</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {userData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            
            {/* Left Column: Profile Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-1 bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl border border-white/80 overflow-hidden flex flex-col"
            >
              <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              
              <div className="px-6 pb-6 pt-0 flex flex-col items-center relative flex-1">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative inline-block cursor-pointer group -mt-16 mb-4"
                  onClick={() => setShowModal(true)}
                >
                  {userData.imageURL ? (
                    <img 
                      src={userData.imageURL} 
                      alt="Profile" 
                      className="rounded-full shadow-xl w-32 h-32 object-cover border-4 border-white bg-white"
                    />
                  ) : (
                    <div className="rounded-full bg-white shadow-xl w-32 h-32 flex items-center justify-center border-4 border-white">
                      <UserCircle className="w-16 h-16 text-indigo-300" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-indigo-600 rounded-full p-2 shadow-lg group-hover:bg-indigo-700 transition-all text-white">
                    <Camera className="w-4 h-4" />
                  </div>
                </motion.div>

                <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
                  {userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.firstName || 'User Profile'}
                </h2>
                <p className="text-sm text-gray-500 font-medium mb-6 text-center">{userData.email}</p>

                <div className="w-full mt-auto space-y-3">
                  <button 
                    className="w-full flex justify-center items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                    onClick={() => navigate("/change-password")}
                  >
                    <Key className="w-4 h-4" />
                    Change Password
                  </button>
                  <button 
                    className="w-full flex justify-center items-center gap-2 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    onClick={() => window.history.back()}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Settings Details */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2 space-y-6"
            >
              <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl border border-white/80 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Personal Information
                </h3>
                <div className="space-y-6">
                  {renderEditableField('fullName', 'Full Name', User)}
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-2">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      Email Address
                    </label>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-5 py-3.5 rounded-xl border-2 border-gray-200 text-sm flex items-center justify-between">
                      <span className="font-medium text-gray-800">{userData.email}</span>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">Cannot be changed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl border border-white/80 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Additional Details
                </h3>
                <div className="space-y-6">
                  {renderEditableField('dob', 'Date of Birth', Calendar, 'date')}
                  {renderEditableField('gender', 'Gender', UserCircle, 'select', ['Male', 'Female', 'Other', 'Prefer not to say'])}
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isUploading && setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Profile Photo
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors" 
                  onClick={() => setShowModal(false)} 
                  disabled={isUploading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className={`text-center transition-opacity ${isUploading ? 'opacity-50' : ''}`}>
                <div className="mx-auto rounded-full overflow-hidden w-40 h-40 mb-6 border-4 border-gray-100 shadow-lg">
                  {userData.imageURL || selectedFile ? (
                    <img 
                      src={selectedFile ? URL.createObjectURL(selectedFile) : userData.imageURL} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <UserCircle className="w-24 h-24 text-indigo-300" />
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="mb-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Processing...</p>
                  </div>
                )}

                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileSelected} 
                  className="hidden" 
                  disabled={isUploading} 
                />

                <div className="flex justify-center gap-3">
                  {userData.imageURL && (
                    <button 
                      className="flex items-center gap-2 px-5 py-3 border-2 border-red-500 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all disabled:opacity-50" 
                      onClick={handleRemoveImage} 
                      disabled={isUploading}
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                  <button 
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50" 
                    onClick={handleChangeClick} 
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4" />
                    {userData.imageURL ? 'Change' : 'Upload'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Profile;