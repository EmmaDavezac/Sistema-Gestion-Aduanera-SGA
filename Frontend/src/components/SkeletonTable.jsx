// SkeletonTable.jsx
const SkeletonTable = ({ rows = 5 }) => (
  <div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl mb-4 border border-gray-100 dark:border-gray-700 flex justify-between items-center animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div>
            <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="w-44 h-2.5 bg-gray-100 dark:bg-gray-600 rounded" />
          </div>
        </div>
        <div className="w-10 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg" />
      </div>
    ))}
  </div>
);

export default SkeletonTable;