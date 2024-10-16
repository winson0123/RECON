import SearchBar from "./search-bar"
import ModeToggle from "./mode-toggle"

export default function NavBar() {
  return (
    <nav className="mb-3 mt-0 flex items-center justify-between bg-secondary px-4 py-2">
      <div className="text-primary">Brand</div>
      <div className="flex flex-grow justify-center">
        <SearchBar />
      </div>
      <div className="justify-content-end">
        <ModeToggle />
      </div>
    </nav>
  )
}
