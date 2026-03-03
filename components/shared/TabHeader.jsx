/**
 * TabHeader component for managing tab headers.
 *
 * @param {Object} props - The component's props.
 * @param {string} props.activeTab - The currently active tab.
 * @param {Function} props.tabManager - Function to manage tab clicks.
 * @param {string} props.text - The text to be displayed in the header, with the first letter capitalized.
 * @returns {JSX.Element} The rendered TabHeader component.
 */
const TabHeader = ({ activeTab, tabManager, text }) => {
  return (
    <h1
      onClick={() => tabManager(text)}
      className={`${
        activeTab === text ? "-translate-y-1" : "translate-y-0"
      } cursor-pointer rounded-full border-2 border-primary px-2 transition-all duration-200`}
    >
      {text}
    </h1>
  );
};

export default TabHeader;
