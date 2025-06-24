
const Banner = () => {
    return (
        <div>
            <div className="bg-[#DCE8F5] font-dmsans pt-[103px] pb-[200px]">
                <div className="max-w-[1250px] mx-auto flex gap-4">
                    <div className="w-1/2">
                        <h2 className="font-bold text-[45px]">
                            <p className="text-[#5C5B8F]">Smart Tech</p>
                            <p className="text-[#161E64]">Smarter Learning</p>
                            <p className="text-[#5E5BFB]">Infinite Possibilities</p>
                        </h2>
                        <p className="text-[#5F5B5B] pt-[30px]">
                            From classrooms to lifelong learning, EduGrid supports every step of your learning journey. With real-time progress and a user-friendly experience, we’re redefining education for a smarter tomorrow.
                        </p>
                        <p className="pt-[76px]">
                            <input type="text" name="search" id="" placeholder="what do u want to learn" className="pl-[58px] pr-[94px] bg-white py-[20px] font-medium text-[22px] text-[#868181] rounded-l-[11px]" />
                            <button className="bg-[#423FE5] text-white font-medium text-[22px] py-[20px] px-[28px] rounded-r-[11px]">Search Course</button>
                        </p>
                    </div>
                    <div className="w-1/2 flex justify-between">
                        <img
                            src="/public/BannerImg/banner1.jpg"
                            className="w-[278px] h-[350px] rounded-[14px] self-end"
                            style={{
                                animation: 'float 3s ease-in-out infinite',
                            }}
                            alt=""
                        />
                        <img
                            src="/public/BannerImg/banner2.jpg"
                            className="w-[278px] h-[350px] rounded-[14px]"
                            style={{
                                animation: 'float 3s ease-in-out infinite',
                                animationDelay: '1.5s',
                            }}
                            alt=""
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;