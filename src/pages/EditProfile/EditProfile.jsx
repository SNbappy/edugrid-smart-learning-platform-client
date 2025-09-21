import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import { Country, State } from 'country-state-city';
import { uploadImageToImgBB, validateImageFile, compressImage } from '../../services/imageUpload';

const EditProfile = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [userData, setUserData] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState(null);

    // Dynamic location data
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [selectedCountryCode, setSelectedCountryCode] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    // Watch for country changes
    const watchedCountry = watch('country');

    // Load countries on component mount
    useEffect(() => {
        const allCountries = Country.getAllCountries();
        setCountries(allCountries);
    }, []);

    // Update states when country changes
    useEffect(() => {
        if (selectedCountryCode) {
            const countryStates = State.getStatesOfCountry(selectedCountryCode);
            setStates(countryStates);
        } else {
            setStates([]);
        }
    }, [selectedCountryCode]);

    // Handle country selection
    const handleCountryChange = (e) => {
        const selectedCountry = countries.find(country => country.name === e.target.value);
        if (selectedCountry) {
            setSelectedCountryCode(selectedCountry.isoCode);
            setValue('district', '');
        } else {
            setSelectedCountryCode('');
        }
    };

    // Fetch user data when component loads
    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.email) {
                try {
                    console.log('📋 Fetching user data for:', user.email);
                    const response = await axiosPublic.get(`/users/${user.email}`);

                    if (response.data.success) {
                        const fetchedUser = response.data.user;
                        setUserData(fetchedUser);

                        // Populate form with existing data
                        setValue('name', fetchedUser.name || '');
                        setValue('email', fetchedUser.email || '');
                        setValue('bio', fetchedUser.profile?.bio || '');
                        setValue('country', fetchedUser.profile?.country || '');
                        setValue('district', fetchedUser.profile?.district || '');
                        setValue('institution', fetchedUser.profile?.institution || '');
                        setValue('facebook', fetchedUser.profile?.facebook || '');
                        setValue('linkedin', fetchedUser.profile?.linkedin || '');
                        setValue('mailLink', fetchedUser.profile?.mailLink || '');

                        // Set photo preview if exists
                        if (fetchedUser.photoURL) {
                            setPhotoPreview(fetchedUser.photoURL);
                        }

                        // FIXED: Cover photo should be at root level, same as profile picture
                        if (fetchedUser.coverPhotoURL) {
                            setCoverPreview(fetchedUser.coverPhotoURL);
                        }

                        // Set selected country code for existing data
                        if (fetchedUser.profile?.country) {
                            const existingCountry = Country.getAllCountries().find(
                                country => country.name === fetchedUser.profile.country
                            );
                            if (existingCountry) {
                                setSelectedCountryCode(existingCountry.isoCode);
                            }
                        }

                        console.log('✅ User data loaded:', fetchedUser);
                    }
                } catch (error) {
                    console.error('❌ Error fetching user data:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Failed to load user data. Please try again.',
                    });
                }
            }
        };

        if (!loading && user) {
            fetchUserData();
        }
    }, [user, loading, axiosPublic, setValue]);

    // Handle profile photo selection
    const handlePhotoChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File!',
                text: validation.error,
            });
            return;
        }

        setSelectedFile(file);

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Handle cover photo selection
    const handleCoverPhotoChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File!',
                text: validation.error,
            });
            return;
        }

        setSelectedCoverFile(file);

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Upload profile photo to ImgBB
    const uploadPhoto = async () => {
        if (!selectedFile) return null;

        setIsUploadingImage(true);
        try {
            console.log('📤 Uploading profile photo to ImgBB...');

            // Compress image before upload
            const compressedFile = await compressImage(selectedFile, 800, 0.8);

            // Upload to ImgBB
            const uploadResult = await uploadImageToImgBB(compressedFile);

            if (uploadResult.success) {
                console.log('✅ Profile photo uploaded successfully:', uploadResult.url);
                return uploadResult.url;
            } else {
                throw new Error(uploadResult.error);
            }
        } catch (error) {
            console.error('❌ Profile photo upload failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed!',
                text: 'Failed to upload profile photo. Please try again.',
            });
            return null;
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Upload cover photo to ImgBB
    const uploadCoverPhoto = async () => {
        if (!selectedCoverFile) return null;

        setIsUploadingCover(true);
        try {
            console.log('📤 Uploading cover photo to ImgBB...');

            // Compress image before upload
            const compressedFile = await compressImage(selectedCoverFile, 1200, 0.8);

            // Upload to ImgBB
            const uploadResult = await uploadImageToImgBB(compressedFile);

            if (uploadResult.success) {
                console.log('✅ Cover photo uploaded successfully:', uploadResult.url);
                return uploadResult.url;
            } else {
                throw new Error(uploadResult.error);
            }
        } catch (error) {
            console.error('❌ Cover photo upload failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed!',
                text: 'Failed to upload cover photo. Please try again.',
            });
            return null;
        } finally {
            setIsUploadingCover(false);
        }
    };

    // FIXED: onSubmit function - Save cover photo at root level like profile photo
    const onSubmit = async (data) => {
        setIsLoading(true);
        console.log('📝 Updating profile with data:', data);

        try {
            let photoURL = userData?.photoURL || '';
            let coverPhotoURL = userData?.coverPhotoURL || ''; // FIXED: Get from root level

            // Upload new profile photo if selected
            if (selectedFile) {
                const uploadedPhotoURL = await uploadPhoto();
                if (uploadedPhotoURL) {
                    photoURL = uploadedPhotoURL;
                } else {
                    return;
                }
            }

            // Upload new cover photo if selected
            if (selectedCoverFile) {
                const uploadedCoverURL = await uploadCoverPhoto();
                if (uploadedCoverURL) {
                    coverPhotoURL = uploadedCoverURL;
                } else {
                    return;
                }
            }

            // FIXED: Save cover photo at root level, same as profile photo
            const updateData = {
                name: data.name,
                photoURL: photoURL, // Root level
                coverPhotoURL: coverPhotoURL, // Root level - FIXED
                bio: data.bio,
                country: data.country,
                district: data.district,
                institution: data.institution,
                facebook: data.facebook,
                linkedin: data.linkedin,
                mailLink: data.mailLink
            };

            console.log('📝 Sending update data:', updateData);

            const response = await axiosPublic.put(`/users/${user.email}`, updateData);

            console.log('✅ Profile update response:', response.data);

            if (response.data.success) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Profile updated successfully!",
                    showConfirmButton: false,
                    timer: 1500
                });

                // Clear selected files after successful upload
                setSelectedFile(null);
                setSelectedCoverFile(null);

                // FIXED: Update local userData state with new data
                setUserData(prev => ({
                    ...prev,
                    name: data.name,
                    photoURL: photoURL,
                    coverPhotoURL: coverPhotoURL, // FIXED: Root level
                    profile: {
                        ...prev?.profile,
                        bio: data.bio,
                        country: data.country,
                        district: data.district,
                        institution: data.institution,
                        facebook: data.facebook,
                        linkedin: data.linkedin,
                        mailLink: data.mailLink
                    }
                }));

                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed!',
                text: 'Failed to update profile. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#457B9D] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Helmet>
                <title>EduGrid | Edit Profile</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Professional Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-800">Edit Profile</h1>
                            <p className="text-slate-600 mt-1">Update your personal information and preferences</p>
                        </div>

                        {/* Main Content */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Cover and Profile Photo Section */}
                                <div className="relative">
                                    {/* Cover Photo Section */}
                                    <div className="relative h-48 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] overflow-hidden">
                                        {coverPreview ? (
                                            <img
                                                src={coverPreview}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] flex items-center justify-center">
                                                <div className="text-center text-white">
                                                    <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-sm opacity-75">Add a cover photo</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cover Photo Upload Button */}
                                        <label className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 px-4 py-2 rounded-lg cursor-pointer transition-all shadow-md text-sm font-medium">
                                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {coverPreview ? 'Change Cover' : 'Add Cover'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverPhotoChange}
                                                className="hidden"
                                                disabled={isUploadingCover}
                                            />
                                        </label>

                                        {/* Cover Upload Loading */}
                                        {isUploadingCover && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="bg-white rounded-lg p-4 flex items-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#457B9D] border-t-transparent mr-3"></div>
                                                    <span className="text-slate-700 font-medium">Uploading cover photo...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Profile Photo Section */}
                                    <div className="relative px-8 pb-8">
                                        <div className="flex -mt-16 mb-6">
                                            <div className="relative">
                                                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                                                    {photoPreview ? (
                                                        <img
                                                            src={photoPreview}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Profile Photo Upload Button */}
                                                <label className="absolute bottom-1 right-1 bg-[#457B9D] text-white p-2 rounded-full cursor-pointer hover:bg-[#3a6b8a] transition-colors shadow-lg border-2 border-white">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoChange}
                                                        className="hidden"
                                                        disabled={isUploadingImage}
                                                    />
                                                </label>

                                                {/* Profile Photo Upload Loading */}
                                                {isUploadingImage && (
                                                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 mb-1">
                                                {userData?.name || user?.displayName || 'User Name'}
                                            </h2>
                                            <p className="text-slate-600 text-sm mb-2">{user?.email}</p>
                                            {userData?.profile?.institution && (
                                                <p className="text-slate-500 text-sm mb-4">{userData.profile.institution}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Content - Rest of the form remains the same */}
                                <div className="px-8">
                                    <div className="space-y-8">
                                        {/* Personal Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-200">
                                                Personal Information
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Full Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        {...register('name', { required: 'Full name is required' })}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all"
                                                        placeholder="Enter your full name"
                                                    />
                                                    {errors.name && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        {...register('email')}
                                                        disabled
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                                                    />
                                                    <p className="mt-1 text-xs text-slate-500">Email address cannot be changed</p>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Institution/Organization
                                                    </label>
                                                    <input
                                                        type="text"
                                                        {...register('institution')}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all"
                                                        placeholder="Where do you study or work?"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-200">
                                                Location
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Country *
                                                    </label>
                                                    <select
                                                        {...register('country', { required: 'Please select a country' })}
                                                        onChange={handleCountryChange}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all"
                                                    >
                                                        <option value="">Select Country</option>
                                                        {countries.map((country) => (
                                                            <option key={country.isoCode} value={country.name}>
                                                                {country.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.country && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        State/District
                                                    </label>
                                                    <select
                                                        {...register('district')}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all disabled:bg-slate-50"
                                                        disabled={!selectedCountryCode}
                                                    >
                                                        <option value="">
                                                            {selectedCountryCode ? 'Select State/District' : 'Select Country First'}
                                                        </option>
                                                        {states.map((state) => (
                                                            <option key={state.isoCode} value={state.name}>
                                                                {state.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* About */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-200">
                                                About
                                            </h3>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Bio/Description
                                                </label>
                                                <textarea
                                                    {...register('bio')}
                                                    rows="4"
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all resize-none"
                                                    placeholder="Tell us about yourself, your interests, and professional background..."
                                                />
                                            </div>
                                        </div>

                                        {/* Professional Links */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-200">
                                                Professional Links
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        LinkedIn Profile
                                                    </label>
                                                    <input
                                                        type="url"
                                                        {...register('linkedin')}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all"
                                                        placeholder="https://linkedin.com/in/username"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Professional Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        {...register('mailLink')}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all"
                                                        placeholder="professional@domain.com"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Facebook Profile
                                                    </label>
                                                    <input
                                                        type="url"
                                                        {...register('facebook')}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all"
                                                        placeholder="https://facebook.com/username"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-slate-200 pb-6">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            disabled={isLoading}
                                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isLoading || isUploadingImage || isUploadingCover}
                                            className="px-8 py-3 bg-[#457B9D] hover:bg-[#3a6b8a] text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                    {(isUploadingImage || isUploadingCover) ? 'Uploading...' : 'Saving...'}
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
