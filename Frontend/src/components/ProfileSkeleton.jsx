// ProfileSkeleton.jsx
const ProfileSkeleton = () => (
  <div className="flex justify-center p-5">
    <div className="w-full max-w-[500px] bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-5 animate-pulse flex items-center justify-center">
        <i className="fa-solid fa-user text-gray-300 dark:text-gray-600 text-3xl"></i>
      </div>
      <div className="w-36 h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-8 animate-pulse" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mb-5">
          <div className="w-16 h-2.5 bg-gray-100 dark:bg-gray-600 rounded mb-2 animate-pulse" />
          <div className="w-full h-10 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 animate-pulse" />
        </div>
      ))}
      <div className="w-full h-11 bg-gray-200 dark:bg-gray-700 rounded-lg mt-5 animate-pulse" />
    </div>
  </div>
);

export default ProfileSkeleton;