import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';

import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CollectionsIcon from '@mui/icons-material/Collections';
import HandshakeIcon from '@mui/icons-material/Handshake';
import OutboxIcon from '@mui/icons-material/Outbox';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { ListItemLink } from './utils'

export const mainListItems = (
    <React.Fragment>
        <ListItemLink to="/create" primary="Create" icon={<AddPhotoAlternateIcon />} />
        <ListItemLink to="/collection" primary="Collection" icon={<CollectionsIcon />} />
            {
            //    <ListItemLink to="/request" primary="Request" icon={<HandshakeIcon />} />
            //    <ListItemLink to="/rental" primary="Rental" icon={<OutboxIcon />} />
            
            //<ListItemLink to="/report" primary="Report" icon={<ReportProblemIcon />} />
        }
        {
            //<ListItemLink to="/upload" primary="Upload" icon={<AddPhotoAlternateIcon />} />
            //<ListItemLink to="/mint" primary="Mint NFT" icon={<BarChartIcon />} />
            //<ListItemLink to="/integrations" primary="Integrations" icon={<LayersIcon />} />
        }
    </React.Fragment>
);

export const secondaryListItems = (
    <React.Fragment>
        <ListSubheader component="div" inset>
            Saved reports
        </ListSubheader>
        <ListItemButton>
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Current month" />
        </ListItemButton>
        <ListItemButton>
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Last quarter" />
        </ListItemButton>
        <ListItemButton>
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Year-end sale" />
        </ListItemButton>
    </React.Fragment>
);
