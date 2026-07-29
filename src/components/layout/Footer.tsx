export function Footer() {
  return (
    <footer className="w-full bg-blue-600 py-6 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 sm:flex-row">
        <div className="flex items-center gap-2 text-white">
          <span className="font-semibold">Campus Connect</span>
        </div>
        <p className="text-sm text-blue-100 text-center">
          Connecting Students with College Administration
        </p>
        <p className="text-sm text-blue-100">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
