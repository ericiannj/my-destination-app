import { useGetPOIs } from '../hooks/useGetPOIs';

const POIList = () => {
  const { pois, loading, error, refreshPOIs } = useGetPOIs();

  if (loading) {
    return (
      <div className="absolute top-4 right- z-10 bg-white rounded-lg shadow-lg p-4 w-72">
        <div className="text-center">Loading POIs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 w-72">
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={refreshPOIs}
          className="mt-2 text-blue-500 hover:text-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-8 right-8 z-10 bg-white rounded-lg shadow-lg p-4 w-72 h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Points of Interest</h2>
        <button
          onClick={refreshPOIs}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-2">
        {pois.length === 0 ? (
          <div className="text-center text-gray-500">No POIs found</div>
        ) : (
          pois.map((poi) => (
            <div
              key={poi.title}
              className="p-2 hover:bg-gray-100 rounded cursor-pointer border border-gray-100"
            >
              <h3 className="font-medium">{poi.title}</h3>
              <p className="text-sm text-gray-600">{poi.description}</p>
              <div className="text-xs text-gray-400 mt-1">
                Lat: {poi.latitude}, Long: {poi.longitude}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default POIList;
