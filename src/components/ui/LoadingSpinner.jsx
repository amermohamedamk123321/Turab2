export function LoadingSpinner({ small = false }) {
  return (
    <div className={`inline-flex ${small ? 'h-4 w-4' : 'h-8 w-8'}`}>
      <div
        className={`animate-spin rounded-full ${
          small ? 'border-2' : 'border-4'
        } border-gray-300 border-t-blue-600`}
      />
    </div>
  );
}

export default LoadingSpinner;
