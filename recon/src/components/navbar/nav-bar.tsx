import SearchBar from "./search-bar"
import ModeToggle from "./mode-toggle"
import SettingsButton from "./settings-button"

export default function NavBar() {
  return (
    <nav className="mb-3 mt-0 flex items-center justify-between bg-secondary px-4 py-2">
      <div className="text-primary text-xl font-semibold"><a href='/'>RECON</a></div>
      <div className="flex flex-grow justify-center">
        <SearchBar />
      </div>
      <div className="justify-content-end">
        <ModeToggle />
      </div>
      <div className="pl-2 justify-content-end">
        <SettingsButton />
      </div>
    </nav>
  )
}
