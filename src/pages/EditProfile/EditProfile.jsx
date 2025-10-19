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
            <div className="min-h-screen flex items-center justify-center" style={{
                backgroundColor: '#f8fafc',
                colorScheme: 'light'
            }}>
                <div className="text-center rounded-2xl p-8 shadow-xl" style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                }}>
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-6" style={{
                            borderColor: 'rgba(69, 123, 157, 0.2)',
                            borderTopColor: '#457B9D'
                        }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full animate-pulse" style={{
                                background: 'linear-gradient(to right, #457B9D, #5D8FB8)'
                            }}></div>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#1e293b' }}>Loading Your Profile</h3>
                    <p style={{ color: '#475569' }}>Please wait while we fetch your information...</p>
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
            `}</style>

            <div className="flex">
                <Sidebar />

                {/* Main Content - Responsive with sidebar adjustment */}
                <div className="flex-1 lg:ml-[320px] p-4 sm:p-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Simplified Professional Header */}
                        <div className="mb-6 sm:mb-8">
                            <nav className="flex items-center space-x-2 text-sm mb-4">
                                <span style={{ color: '#64748b' }}>Dashboard</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#64748b' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="font-medium" style={{ color: '#0f172a' }}>Edit Profile</span>
                            </nav>
                        </div>

                        {/* Main Content Card */}
                        <div className="rounded-2xl shadow-sm overflow-hidden" style={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e2e8f0',
                            borderWidth: '1px',
                            borderStyle: 'solid'
                        }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Cover and Profile Photo Section */}
                                <div className="relative">
                                    {/* Cover Photo Section */}
                                    <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden" style={{
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
                                                <div className="text-center" style={{ color: '#ffffff' }}>
                                                    <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-sm sm:text-base font-medium" style={{ opacity: 0.9 }}>Add Cover Photo</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cover Photo Upload Button */}
                                        <label className="absolute top-4 right-4 sm:top-6 sm:right-6 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl cursor-pointer transition-all shadow-md text-sm font-medium" style={{
                                            backgroundColor: '#ffffff',
                                            color: '#334155'
                                        }}>
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

                                        {/* Upload Loading */}
                                        {isUploadingCover && (
                                            <div className="absolute inset-0 flex items-center justify-center" style={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                backdropFilter: 'blur(4px)'
                                            }}>
                                                <div className="rounded-xl p-6 flex items-center shadow-xl" style={{ backgroundColor: '#ffffff' }}>
                                                    <div className="animate-spin rounded-full h-5 w-5 mr-3" style={{
                                                        borderWidth: '3px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#457B9D',
                                                        borderTopColor: 'transparent'
                                                    }}></div>
                                                    <span className="font-semibold" style={{ color: '#334155' }}>Uploading cover photo...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Profile Photo Section */}
                                    <div className="relative px-6 sm:px-8 md:px-10 pb-8 sm:pb-10" style={{ backgroundColor: '#ffffff' }}>
                                        <div className="flex items-start -mt-12 sm:-mt-14 mb-6 sm:mb-8 relative z-10">
                                            <div className="relative mr-6">
                                                {/* Profile Photo */}
                                                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden shadow-xl" style={{
                                                    backgroundColor: '#ffffff',
                                                    borderWidth: '4px',
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
                                                            <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Profile Photo Upload Button */}
                                                <label className="absolute bottom-2 right-2 p-2.5 rounded-full cursor-pointer transition-all duration-300 shadow-lg" style={{
                                                    background: 'linear-gradient(to right, #457B9D, #5D8FB8)',
                                                    color: '#ffffff',
                                                    borderWidth: '3px',
                                                    borderStyle: 'solid',
                                                    borderColor: '#ffffff'
                                                }}>
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
                                                    <div className="absolute inset-0 rounded-3xl flex items-center justify-center" style={{
                                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                        backdropFilter: 'blur(4px)'
                                                    }}>
                                                        <div className="animate-spin rounded-full h-8 w-8" style={{
                                                            borderWidth: '3px',
                                                            borderStyle: 'solid',
                                                            borderColor: '#ffffff',
                                                            borderTopColor: 'transparent'
                                                        }}></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 pt-4">
                                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2" style={{ color: '#1e293b' }}>
                                                    {userData?.name || user?.displayName || 'User Name'}
                                                </h2>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-sm sm:text-base" style={{ color: '#64748b' }}>{user?.email}</p>
                                                </div>
                                                {userData?.profile?.institution && (
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        <p className="text-sm sm:text-base font-medium" style={{ color: '#64748b' }}>{userData.profile.institution}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Content */}
                                <div className="px-6 sm:px-8 md:px-10 pb-8 space-y-8">
                                    {/* Personal Information Section */}
                                    <div className="rounded-xl p-6 sm:p-8" style={{ backgroundColor: '#f8fafc' }}>
                                        <h3 className="text-lg font-bold mb-6" style={{ color: '#1e293b' }}>Personal Information</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('name', { required: 'Full name is required' })}
                                                    className="w-full px-4 py-3 text-base rounded-lg transition-all"
                                                    placeholder="Enter your full name"
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#1e293b',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#cbd5e1'
                                                    }}
                                                />
                                                {errors.name && (
                                                    <p className="mt-2 text-sm" style={{ color: '#dc2626' }}>{errors.name.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    {...register('email')}
                                                    disabled
                                                    className="w-full px-4 py-3 text-base rounded-lg cursor-not-allowed"
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
                                                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Institution/Organization
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('institution')}
                                                    className="w-full px-4 py-3 text-base rounded-lg transition-all"
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
                                    <div className="rounded-xl p-6 sm:p-8" style={{ backgroundColor: '#f8fafc' }}>
                                        <h3 className="text-lg font-bold mb-6" style={{ color: '#1e293b' }}>Location</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Country *
                                                </label>
                                                <select
                                                    {...register('country', { required: 'Please select a country' })}
                                                    onChange={handleCountryChange}
                                                    className="w-full px-4 py-3 text-base rounded-lg transition-all"
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
                                                {errors.country && (
                                                    <p className="mt-2 text-sm" style={{ color: '#dc2626' }}>{errors.country.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    State/District
                                                </label>
                                                <select
                                                    {...register('district')}
                                                    className="w-full px-4 py-3 text-base rounded-lg transition-all"
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
                                    <div className="rounded-xl p-6 sm:p-8" style={{ backgroundColor: '#f8fafc' }}>
                                        <h3 className="text-lg font-bold mb-6" style={{ color: '#1e293b' }}>About</h3>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                Bio/Description
                                            </label>
                                            <textarea
                                                {...register('bio')}
                                                rows="5"
                                                className="w-full px-4 py-4 text-base rounded-lg transition-all resize-none"
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
                                    <div className="rounded-xl p-6 sm:p-8" style={{ backgroundColor: '#f8fafc' }}>
                                        <h3 className="text-lg font-bold mb-6" style={{ color: '#1e293b' }}>Professional Links</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    LinkedIn Profile
                                                </label>
                                                <input
                                                    type="url"
                                                    {...register('linkedin')}
                                                    className="w-full px-4 py-3 text-base rounded-lg transition-all"
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
                                                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Professional Email
                                                </label>
                                                <input
                                                    type="email"
                                                    {...register('mailLink')}
                                                    className="w-full px-4 py-3 text-base rounded-lg transition-all"
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
                                                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                                                    Facebook Profile
                                                </label>
                                                <input
                                                    type="url"
                                                    {...register('facebook')}
                                                    className="w-full px-4 py-3 text-base rounded-lg transition-all"
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

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            disabled={isLoading}
                                            className="w-full sm:w-auto px-6 py-3 text-base rounded-lg transition-all font-semibold"
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
                                            className="w-full sm:w-auto px-8 py-3 text-base rounded-lg transition-all font-semibold shadow-md"
                                            style={{
                                                background: 'linear-gradient(to right, #457B9D, #5D8FB8)',
                                                color: '#ffffff',
                                                opacity: (isLoading || isUploadingImage || isUploadingCover) ? 0.5 : 1
                                            }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 mr-3 inline-block" style={{
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
