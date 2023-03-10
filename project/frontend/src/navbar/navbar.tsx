import { useState } from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import MuiToggleButton from "@mui/material/ToggleButton";
import { styled } from "@mui/material/styles";
import './navbar.css';
import { Link } from 'react-router-dom';
import { Badge } from '@mui/material';

export default function NavBar() {
    const [focus, setFocus] = useState<string | null>(null);

    const ToggleButton = styled(MuiToggleButton)({
        "&.MuiToggleButton-root": {
            // color: 'red', //Couleur de propagation
            backgroundColor: '#EAEDED',
            ":hover": {
                backgroundColor: '#F4D03F',
            },
        },
        "&.Mui-selected": {
            backgroundColor: '#6C8AE7',
        },
        "&.Mui-selected:hover": {
            backgroundColor: '#BB8FCE',
        },
    })as typeof MuiToggleButton;

    function handleFocus(event: React.MouseEvent, newFocus: string | null,) {
        setFocus(newFocus);
    }

    return (
        <div className='navbar'>
            <ToggleButtonGroup 
                value={focus} 
                onChange={handleFocus}
                exclusive
                orientation="vertical"
                aria-label='navbar'>
                <ToggleButton component={Link} to='game'  value="list" aria-label="game">
                    <SportsEsportsOutlinedIcon color='warning'/>
                </ToggleButton>
                <ToggleButton component={Link} to='chat' value="module" aria-label="chat">
                    <Badge badgeContent={1} color='warning'> {}
                        <ForumOutlinedIcon color='warning' />
                    </Badge>
                </ToggleButton>
                <ToggleButton component={Link} to='setting' value="quilt" aria-label="setting">
                    <TuneOutlinedIcon color='warning'/>
                </ToggleButton>
            </ToggleButtonGroup>
        </div>
    );
}
