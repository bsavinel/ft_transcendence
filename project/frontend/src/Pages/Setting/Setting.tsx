import BoutonThemeMode from '../../Component/BoutonThemeMode/BoutonThemeMode';

interface SettingProps {
    handleTheme: () => void;
}
export default function Setting({handleTheme}: SettingProps) {
    return (
        <BoutonThemeMode handleTheme={handleTheme}/>
    );
}
