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
import { updateProfile } from 'firebase/auth';

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

                        // Set cover photo preview if exists
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
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
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
        if (!selectedFile) {
            return null;
        }

        setIsUploadingImage(true);
        try {
            // Compress image before upload
            const compressedFile = await compressImage(selectedFile, 800, 0.8);

            // Upload to ImgBB
            const uploadResult = await uploadImageToImgBB(compressedFile);

            if (uploadResult.success) {
                return uploadResult.url;
            } else {
                throw new Error(uploadResult.error);
            }
        } catch (error) {
            console.error('Profile photo upload failed:', error);
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
        if (!selectedCoverFile) {
            return null;
        }

        setIsUploadingCover(true);
        try {
            // Compress image before upload
            const compressedFile = await compressImage(selectedCoverFile, 1200, 0.8);

            // Upload to ImgBB
            const uploadResult = await uploadImageToImgBB(compressedFile);

            if (uploadResult.success) {
                return uploadResult.url;
            } else {
                throw new Error(uploadResult.error);
            }
        } catch (error) {
            console.error('Cover photo upload failed:', error);
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

    // THE onSubmit FUNCTION
    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            let photoURL = userData?.photoURL || '';
            let coverPhotoURL = userData?.coverPhotoURL || '';

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

            // Prepare update data
            const updateData = {
                name: data.name,
                photoURL: photoURL,
                coverPhotoURL: coverPhotoURL,
                bio: data.bio,
                country: data.country,
                district: data.district,
                institution: data.institution,
                facebook: data.facebook,
                linkedin: data.linkedin,
                mailLink: data.mailLink
            };

            const response = await axiosPublic.put(`/users/${user.email}`, updateData);

            if (response.data.success) {
                // Update Firebase Auth profile
                try {
                    await updateProfile(user, {
                        displayName: data.name,
                        photoURL: photoURL
                    });
                } catch (firebaseError) {
                    console.error('Firebase profile update error:', firebaseError);
                }

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

                // Update local userData state
                setUserData(prev => ({
                    ...prev,
                    name: data.name,
                    photoURL: photoURL,
                    coverPhotoURL: coverPhotoURL,
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
            console.error('Error updating profile:', error);
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
            <div className="min-h-screen flex items-center justify-center px-4" style={{
                backgroundColor: '#f8fafc',
                colorScheme: 'light'
            }}>
                <div className="text-center rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-sm" style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                }}>
                    <div className="relative">
                        <div className="animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 border-4 mx-auto mb-4 sm:mb-6" style={{
                            borderColor: 'rgba(69, 123, 157, 0.2)',
                            borderTopColor: '#457B9D'
                        }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full animate-pulse" style={{
                                background: 'linear-gradient(to right, #457B9D, #5D8FB8)'
                            }}></div>
                        </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ color: '#1e293b' }}>Loading Your Profile</h3>
                    <p className="text-sm sm:text-base" style={{ color: '#475569' }}>Please wait while we fetch your information...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen" style={{
            backgroundColor: '#f8fafc',
            colorScheme: 'light'
        }}>
            <Helmet>
                <title>EduGrid | Edit Profile</title>
                <meta name="color-scheme" content="light" />
            </Helmet>

            <style>{`
                /* Force light mode colors for this component */
                input, textarea, select {
                    color-scheme: light;
                    background-color: #ffffff !important;
                    color: #1e293b !important;
                    border-color: #cbd5e1 !important;
                }
                
                input::placeholder, textarea::placeholder {
                    color: #94a3b8 !important;
                }
                
                input:disabled {
                    background-color: #f1f5f9 !important;
                    color: #64748b !important;
                }
                
                /* Ensure dropdown options are readable */
                select option {
                    background-color: #ffffff !important;
                    color: #1e293b !important;
                }

                /* Responsive text sizing */
                @media (max-width: 640px) {
                    input, textarea, select {
                        font-size: 16px !important; /* Prevents zoom on iOS */
                    }
                }
            `}</style>

            <div className="flex flex-col lg:flex-row">
                <Sidebar />

                {/* Main Content - Fully Responsive with sidebar adjustment */}
                <div className="flex-1 lg:ml-[320px] p-3 sm:p-4 md:p-6 w-full">
                    <div className="max-w-5xl mx-auto w-full">
                        {/* Simplified Professional Header */}
                        <div className="mb-4 sm:mb-6 md:mb-8">
                            <nav className="flex items-center space-x-2 text-xs sm:text-sm mb-3 sm:mb-4 overflow-x-auto">
                                <span style={{ color: '#64748b' }} className="whitespace-nowrap">Dashboard</span>
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#64748b' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="font-medium whitespace-nowrap" style={{ color: '#0f172a' }}>Edit Profile</span>
                            </nav>
                        </div>

                        {/* Main Content Card */}
                        <div className="rounded-xl sm:rounded-2xl shadow-sm overflow-hidden w-full" style={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e2e8f0',
                            borderWidth: '1px',
                            borderStyle: 'solid'
                        }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Cover and Profile Photo Section */}
                                <div className="relative">
                                    {/* Cover Photo Section - Responsive Heights */}
                                    <div className="relative h-32 xs:h-36 sm:h-40 md:h-48 lg:h-56 overflow-hidden" style={{
                                        background: 'linear-gradient(to bottom right, #457B9D, #5D8FB8, #3a6b8a)'
                                    }}>
                                        {coverPreview ? (
                                            <img
                                                src={coverPreview}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center" style={{
                                                background: 'linear-gradient(to bottom right, #457B9D, #5D8FB8, #3a6b8a)'
                                            }}>
                                                <div className="text-center px-4" style={{ color: '#ffffff' }}>
                                                    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-xs sm:text-sm md:text-base font-medium" style={{ opacity: 0.9 }}>Add Cover Photo</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cover Photo Upload Button - Responsive */}
                                        <label className="absolute top-2 right-2 xs:top-3 xs:right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 px-3 py-1.5 xs:px-3.5 xs:py-2 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-lg sm:rounded-xl cursor-pointer transition-all shadow-md text-xs sm:text-sm font-medium" style={{
                                            backgroundColor: '#ffffff',
                                            color: '#334155'
                                        }}>
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="hidden xs:inline">{coverPreview ? 'Change Cover' : 'Add Cover'}</span>
                                            <span className="xs:hidden">{coverPreview ? 'Change' : 'Add'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverPhotoChange}
                                                className="hidden"
                                                disabled={isUploadingCover}
                                            />
                                        </label>

                                        {/* Upload Loading */}
                                        {isUploadingCover && (
                                            <div className="absolute inset-0 flex items-center justify-center" style={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                backdropFilter: 'blur(4px)'
                                            }}>
                                                <div className="rounded-lg sm:rounded-xl p-4 sm:p-6 flex items-center shadow-xl" style={{ backgroundColor: '#ffffff' }}>
                                                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" style={{
                                                        borderWidth: '3px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#457B9D',
                                                        borderTopColor: 'transparent'
                                                    }}></div>
                                                    <span className="font-semibold text-xs sm:text-sm md:text-base" style={{ color: '#334155' }}>Uploading...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Profile Photo Section - Responsive */}
                                    <div className="relative px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 pb-6 sm:pb-8 md:pb-10" style={{ backgroundColor: '#ffffff' }}>
                                        <div className="flex flex-col xs:flex-row items-start xs:items-end -mt-10 xs:-mt-12 sm:-mt-14 mb-4 sm:mb-6 md:mb-8 relative z-10">
                                            <div className="relative mr-0 xs:mr-4 sm:mr-6 mb-3 xs:mb-0">
                                                {/* Profile Photo - Responsive Sizes */}
                                                <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl" style={{
                                                    backgroundColor: '#ffffff',
                                                    borderWidth: '3px',
                                                    borderStyle: 'solid',
                                                    borderColor: '#ffffff'
                                                }}>
                                                    {photoPreview ? (
                                                        <img
                                                            src={photoPreview}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center" style={{
                                                            background: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)'
                                                        }}>
                                                            <svg className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Profile Photo Upload Button - Responsive */}
                                                <label className="absolute bottom-1 right-1 xs:bottom-1.5 xs:right-1.5 sm:bottom-2 sm:right-2 p-1.5 xs:p-2 sm:p-2.5 rounded-full cursor-pointer transition-all duration-300 shadow-lg" style={{
                                                    background: 'linear-gradient(to right, #457B9D, #5D8FB8)',
                                                    color: '#ffffff',
                                                    borderWidth: '2px',
                                                    borderStyle: 'solid',
                                                    borderColor: '#ffffff'
                                                }}>
                                                    <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl flex items-center justify-center" style={{
                                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                        backdropFilter: 'blur(4px)'
                                                    }}>
                                                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8" style={{
                                                            borderWidth: '3px',
                                                            borderStyle: 'solid',
                                                            borderColor: '#ffffff',
                                                            borderTopColor: 'transparent'
                                                        }}></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* User Info - Responsive */}
                                            <div className="flex-1 pt-2 xs:pt-4 w-full xs:w-auto">
                                                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 break-words" style={{ color: '#1e293b' }}>
                                                    {userData?.studentID && userData?.name
                                                        ? `${userData.studentID} - ${userData.name}`
                                                        : userData?.name || user?.displayName || 'User Name'}
                                                </h2>
                                                <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-xs xs:text-sm sm:text-base truncate" style={{ color: '#64748b' }}>{user?.email}</p>
                                                </div>
                                                {userData?.profile?.institution && (
                                                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        <p className="text-xs xs:text-sm sm:text-base font-medium break-words" style={{ color: '#64748b' }}>{userData.profile.institution}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Content - Responsive Spacing */}
                                <div className="px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 pb-6 sm:pb-8 space-y-5 sm:space-y-6 md:space-y-8">
                                    {/* Personal Information Section */}
                                    <div className="rounded-lg sm:rounded-xl p-4 xs:p-5 sm:p-6 md:p-8" style={{ backgroundColor: '#f8fafc' }}>
                                        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6" style={{ color: '#1e293b' }}>Personal Information</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                                            <div className="md:col-span-2 lg:col-span-1">
                                                <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Full Name (Format: 6-Digit StudentID - Name) *
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('name', {
                                                        required: 'Full name is required',
                                                        pattern: {
                                                            value: /^\d{6}\s*-\s*.+$/,
                                                            message: 'Name must follow format: 6-digit StudentID - Name (e.g., 200109 - Md. Sabbir Hossain Bappy)'
                                                        }
                                                    })}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-lg transition-all"
                                                    placeholder="e.g., 200109 - Md. Sabbir Hossain Bappy"
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#1e293b',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#cbd5e1'
                                                    }}
                                                />
                                                {errors.name && (
                                                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm" style={{ color: '#dc2626' }}>{errors.name.message}</p>
                                                )}
                                            </div>

                                            <div className="md:col-span-2 lg:col-span-1">
                                                <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    {...register('email')}
                                                    disabled
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-lg cursor-not-allowed"
                                                    style={{
                                                        backgroundColor: '#f1f5f9',
                                                        color: '#64748b',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#cbd5e1'
                                                    }}
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Institution/Organization
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('institution')}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-lg transition-all"
                                                    placeholder="Where do you study or work?"
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#1e293b',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#cbd5e1'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Section */}
                                    <div className="rounded-lg sm:rounded-xl p-4 xs:p-5 sm:p-6 md:p-8" style={{ backgroundColor: '#f8fafc' }}>
                                        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6" style={{ color: '#1e293b' }}>Location</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Country
                                                </label>
                                                <select
                                                    {...register('country')}
                                                    onChange={handleCountryChange}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-lg transition-all"
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#1e293b',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#cbd5e1'
                                                    }}
                                                >
                                                    <option value="">Select Country</option>
                                                    {countries.map((country) => (
                                                        <option key={country.isoCode} value={country.name}>
                                                            {country.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    State/District
                                                </label>
                                                <select
                                                    {...register('district')}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-lg transition-all"
                                                    disabled={!selectedCountryCode}
                                                    style={{
                                                        backgroundColor: selectedCountryCode ? '#ffffff' : '#f1f5f9',
                                                        color: '#1e293b',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#cbd5e1'
                                                    }}
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

                                    {/* About Section */}
                                    <div className="rounded-lg sm:rounded-xl p-4 xs:p-5 sm:p-6 md:p-8" style={{ backgroundColor: '#f8fafc' }}>
                                        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6" style={{ color: '#1e293b' }}>About</h3>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                Bio/Description
                                            </label>
                                            <textarea
                                                {...register('bio')}
                                                rows="5"
                                                className="w-full px-3 xs:px-4 py-3 xs:py-4 text-sm xs:text-base rounded-lg transition-all resize-none"
                                                placeholder="Tell us about yourself..."
                                                style={{
                                                    backgroundColor: '#ffffff',
                                                    color: '#1e293b',
                                                    borderWidth: '1px',
                                                    borderStyle: 'solid',
                                                    borderColor: '#cbd5e1'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Professional Links Section */}
                                    <div className="rounded-lg sm:rounded-xl p-4 xs:p-5 sm:p-6 md:p-8" style={{ backgroundColor: '#f8fafc' }}>
                                        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6" style={{ color: '#1e293b' }}>Professional Links</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    LinkedIn Profile
                                                </label>
                                                <input
                                                    type="url"
                                                    {...register('linkedin')}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-lg transition-all"
                                                    placeholder="https://linkedin.com/in/username"
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#1e293b',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#cbd5e1'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Professional Email
                                                </label>
                                                <input
                                                    type="email"
                                                    {...register('mailLink')}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-lg transition-all"
                                                    placeholder="professional@domain.com"
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#1e293b',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#cbd5e1'
                                                    }}
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Facebook Profile
                                                </label>
                                                <input
                                                    type="url"
                                                    {...register('facebook')}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-lg transition-all"
                                                    placeholder="https://facebook.com/username"
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#1e293b',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#cbd5e1'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons - Fully Responsive */}
                                    <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 md:space-x-4 pt-2 sm:pt-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            disabled={isLoading}
                                            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all font-semibold"
                                            style={{
                                                backgroundColor: '#ffffff',
                                                color: '#334155',
                                                borderWidth: '2px',
                                                borderStyle: 'solid',
                                                borderColor: '#cbd5e1'
                                            }}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isLoading || isUploadingImage || isUploadingCover}
                                            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all font-semibold shadow-md"
                                            style={{
                                                background: 'linear-gradient(to right, #457B9D, #5D8FB8)',
                                                color: '#ffffff',
                                                opacity: (isLoading || isUploadingImage || isUploadingCover) ? 0.5 : 1
                                            }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 inline-block" style={{
                                                        borderWidth: '2px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#ffffff',
                                                        borderTopColor: 'transparent'
                                                    }}></div>
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
