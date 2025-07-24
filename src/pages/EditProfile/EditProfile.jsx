import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import { Country, State, City } from 'country-state-city';
import { uploadImageToImgBB, validateImageFile, compressImage } from '../../services/imageUpload';

const EditProfile = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [userData, setUserData] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Dynamic location data
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedStateCode, setSelectedStateCode] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    // Watch for country and state changes
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
            setCities([]);
            setSelectedStateCode('');
        } else {
            setStates([]);
            setCities([]);
        }
    }, [selectedCountryCode]);

    // Update cities when state changes
    useEffect(() => {
        if (selectedCountryCode && selectedStateCode) {
            const stateCities = City.getCitiesOfState(selectedCountryCode, selectedStateCode);
            setCities(stateCities);
        } else {
            setCities([]);
        }
    }, [selectedCountryCode, selectedStateCode]);

    // Handle country selection
    const handleCountryChange = (e) => {
        const selectedCountry = countries.find(country => country.name === e.target.value);
        if (selectedCountry) {
            setSelectedCountryCode(selectedCountry.isoCode);
            setValue('district', '');
            setValue('city', '');
        } else {
            setSelectedCountryCode('');
        }
    };

    // Handle state selection
    const handleStateChange = (e) => {
        const selectedState = states.find(state => state.name === e.target.value);
        if (selectedState) {
            setSelectedStateCode(selectedState.isoCode);
            setValue('city', '');
        } else {
            setSelectedStateCode('');
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
                        setValue('city', fetchedUser.profile?.city || '');
                        setValue('institution', fetchedUser.profile?.institution || '');
                        setValue('facebook', fetchedUser.profile?.facebook || '');
                        setValue('linkedin', fetchedUser.profile?.linkedin || '');
                        setValue('mailLink', fetchedUser.profile?.mailLink || '');

                        // Set photo preview if exists
                        if (fetchedUser.photoURL) {
                            setPhotoPreview(fetchedUser.photoURL);
                        }

                        // Set selected country code for existing data
                        if (fetchedUser.profile?.country) {
                            const existingCountry = Country.getAllCountries().find(
                                country => country.name === fetchedUser.profile.country
                            );
                            if (existingCountry) {
                                setSelectedCountryCode(existingCountry.isoCode);

                                // Set selected state if exists
                                if (fetchedUser.profile?.district) {
                                    setTimeout(() => {
                                        const existingState = State.getStatesOfCountry(existingCountry.isoCode).find(
                                            state => state.name === fetchedUser.profile.district
                                        );
                                        if (existingState) {
                                            setSelectedStateCode(existingState.isoCode);
                                        }
                                    }, 100);
                                }
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

    // Handle photo selection and upload
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

    // Upload image to ImgBB
    const uploadPhoto = async () => {
        if (!selectedFile) return null;

        setIsUploadingImage(true);
        try {
            console.log('📤 Uploading image to ImgBB...');

            // Compress image before upload
            const compressedFile = await compressImage(selectedFile, 800, 0.8);

            // Upload to ImgBB
            const uploadResult = await uploadImageToImgBB(compressedFile);

            if (uploadResult.success) {
                console.log('✅ Image uploaded successfully:', uploadResult.url);
                return uploadResult.url;
            } else {
                throw new Error(uploadResult.error);
            }
        } catch (error) {
            console.error('❌ Image upload failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed!',
                text: 'Failed to upload image. Please try again.',
            });
            return null;
        } finally {
            setIsUploadingImage(false);
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        console.log('📝 Updating profile with data:', data);

        try {
            let photoURL = userData?.photoURL || '';

            // Upload new photo if selected
            if (selectedFile) {
                const uploadedPhotoURL = await uploadPhoto();
                if (uploadedPhotoURL) {
                    photoURL = uploadedPhotoURL;
                } else {
                    // If photo upload failed, ask user if they want to continue
                    const result = await Swal.fire({
                        title: 'Photo Upload Failed',
                        text: 'Do you want to save other changes without updating the photo?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Save Without Photo',
                        cancelButtonText: 'Cancel'
                    });

                    if (!result.isConfirmed) {
                        setIsLoading(false);
                        return;
                    }
                }
            }

            // In your onSubmit function, remove role from updateData:
            const updateData = {
                name: data.name,
                bio: data.bio,
                country: data.country,
                district: data.district,
                city: data.city || '',
                institution: data.institution,
                facebook: data.facebook,
                linkedin: data.linkedin,
                mailLink: data.mailLink,
                photoURL: photoURL
                // ❌ Removed: role: data.role
            };


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

                // Clear selected file after successful upload
                setSelectedFile(null);

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
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | Edit Profile</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Profile</h1>
                                    <p className="text-lg text-gray-600">Manage your personal information and preferences</p>
                                </div>
                                <div className="hidden md:flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] flex items-center justify-center shadow-lg">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Profile Form */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Photo Upload Section */}
                                <div className="bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] px-8 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-6">
                                            <div className="w-40 h-40 rounded-full overflow-hidden border-6 border-white shadow-2xl bg-white flex items-center justify-center">
                                                {photoPreview ? (
                                                    <img
                                                        src={photoPreview}
                                                        alt="Profile Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-gray-400 text-center">
                                                        <svg className="w-16 h-16 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                        <p className="text-sm font-medium">No Photo</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Upload Status Indicator */}
                                            {isUploadingImage && (
                                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                                </div>
                                            )}

                                            <div className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                                                <label className="cursor-pointer">
                                                    <svg className="w-5 h-5 text-[#457B9D]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                    </svg>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoChange}
                                                        className="hidden"
                                                        disabled={isUploadingImage}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <label className="cursor-pointer bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-colors font-medium disabled:opacity-50">
                                            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            {selectedFile ? 'Change Photo' : 'Upload New Photo'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                                disabled={isUploadingImage}
                                            />
                                        </label>

                                        <p className="text-white/80 text-sm mt-3">
                                            Maximum file size: 32MB. Supported: JPG, PNG, GIF, WebP
                                        </p>

                                        {selectedFile && (
                                            <p className="text-white/90 text-sm mt-2 bg-white/20 px-3 py-1 rounded-full">
                                                ✓ New photo selected: {selectedFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Rest of your form fields remain the same */}
                                {/* Form Fields */}
                                <div className="p-8">
                                    {/* Personal Information Section */}
                                    <div className="mb-10">
                                        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-[#457B9D]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            Personal Information
                                        </h3>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Name */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('name', { required: 'Name is required' })}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                    placeholder="Enter your full name"
                                                />
                                                {errors.name && (
                                                    <span className="text-red-500 text-sm font-medium flex items-center mt-2">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.name.message}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Email (Read-only) */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    {...register('email')}
                                                    disabled
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                                                    placeholder="Email cannot be changed"
                                                />
                                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Email address is locked for security
                                                </p>
                                            </div>

                                            {/* Institution */}
                                            <div className="lg:col-span-2 space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Institution/School
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('institution')}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                    placeholder="Where do you study or work?"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Section */}
                                    <div className="mb-10">
                                        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-[#457B9D]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            Location Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Country */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Country *
                                                </label>
                                                <select
                                                    {...register('country', {
                                                        required: 'Please select a country'
                                                    })}
                                                    onChange={(e) => {
                                                        handleCountryChange(e);
                                                    }}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                >
                                                    <option value="">Select Country</option>
                                                    {countries.map((country) => (
                                                        <option key={country.isoCode} value={country.name}>
                                                            {country.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.country && (
                                                    <span className="text-red-500 text-sm font-medium flex items-center mt-2">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.country.message}
                                                    </span>
                                                )}
                                            </div>

                                            {/* State/District */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    State/District
                                                </label>
                                                <select
                                                    {...register('district')}
                                                    onChange={handleStateChange}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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

                                            {/* City */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    City (Optional)
                                                </label>
                                                <select
                                                    {...register('city')}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    disabled={!selectedStateCode}
                                                >
                                                    <option value="">
                                                        {selectedStateCode ? 'Select City' : 'Select State First'}
                                                    </option>
                                                    {cities.slice(0, 50).map((city) => (
                                                        <option key={city.name} value={city.name}>
                                                            {city.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {cities.length > 50 && (
                                                    <p className="text-xs text-gray-500 mt-1">Showing top 50 cities for better performance</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio Section */}
                                    <div className="mb-10">
                                        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-[#457B9D]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                            </svg>
                                            About You
                                        </h3>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Bio/Description
                                            </label>
                                            <textarea
                                                {...register('bio')}
                                                rows="5"
                                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                                                placeholder="Tell us about yourself, your interests, goals, and what makes you unique..."
                                            />
                                            <p className="text-xs text-gray-500">Share your story, achievements, or anything you'd like others to know about you.</p>
                                        </div>
                                    </div>

                                    {/* Social Media Section */}
                                    <div className="mb-10">
                                        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-[#457B9D]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            Social & Professional Links
                                        </h3>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Facebook */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                                                    </svg>
                                                    Facebook Profile
                                                </label>
                                                <input
                                                    type="url"
                                                    {...register('facebook')}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                    placeholder="https://facebook.com/username"
                                                />
                                            </div>

                                            {/* LinkedIn */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                                                    </svg>
                                                    LinkedIn Profile
                                                </label>
                                                <input
                                                    type="url"
                                                    {...register('linkedin')}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                    placeholder="https://linkedin.com/in/username"
                                                />
                                            </div>

                                            {/* Professional Email */}
                                            <div className="lg:col-span-2 space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                    </svg>
                                                    Professional Email
                                                </label>
                                                <input
                                                    type="email"
                                                    {...register('mailLink')}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                    placeholder="professional@email.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={isLoading || isUploadingImage}
                                            className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white rounded-xl hover:from-[#3a6b8a] hover:to-[#2d5a73] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                    {isUploadingImage ? 'Uploading Photo...' : 'Updating Profile...'}
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Update Profile
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            disabled={isLoading}
                                            className="flex-1 sm:flex-none px-8 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center disabled:opacity-50"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            Cancel
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
