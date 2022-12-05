import React, {useState, useEffect} from 'react';
import { alpha, styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import {Link as MUIlink} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Link from "next/link"
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


import { mainListItems, secondaryListItems } from './listItems';
import { ConnectAccount } from './accountHandler';
import {splitTimestamp} from './utils'

const StyledMenu = styled((props: MenuProps) => (
    <Menu
      elevation={0}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}
    />
  ))(({ theme }) => ({
    '& .MuiPaper-root': {
      borderRadius: 6,
      marginTop: theme.spacing(1),
      minWidth: 180,
      color:
        theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
      boxShadow:
        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
      '& .MuiMenu-list': {
        padding: '4px 0',
      },
      '& .MuiMenuItem-root': {
        '& .MuiSvgIcon-root': {
          fontSize: 18,
          color: theme.palette.text.secondary,
          marginRight: theme.spacing(1.5),
        },
        '&:active': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  }));

function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <MUIlink color="inherit" href="https://mui.com/">
                Your Website
            </MUIlink>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const mdTheme = createTheme();

export function DashboardContent({children}:{
    children?: React.ReactNode
}): JSX.Element {
    const [open, setOpen] = useState(true);
    const [account, setAccount] = useState<string>();
    const [isConnected, setIsConnected] = useState(false)

    const [rentalLogsJson, setRentalLogsJson] = useState<any>()
    const [latestTimestamp, setLatestTimestamp] = useState<string>('0')
    const [pastTimestamps, setPastTimestamps] = useState<string[]>([]);
    const [futureTimestamps, setFutureTimestamps] = useState<string[]>([]);

    const [badgeCounters, setBadgeCounters] = useState<number>(futureTimestamps.length)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    useEffect( () => {
        setBadgeCounters(futureTimestamps.length)
    }, [futureTimestamps])

    const toggleDrawer = () => {
        setOpen(!open);
    };
    
    const handleNotiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        //updateLatestTimestamp(setLatestTimestamp, new Date().getTime().toString());
    };

    const handleNotiClose = () => {
        setAnchorEl(null);
    };


    const notificationHandler = async (
        setPastTimestamps: React.Dispatch<React.SetStateAction<string[]>>,
        setFutureTimestamps: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        if (account) {
            let rentalLogs = await fetch("http://172.30.0.1:8090/rental-logs/" + account, {
                method: "GET",
            })
            let rentalLogsJson = await rentalLogs.json()


            let userLogs = await fetch("http://172.30.0.1:8090/user-logs/" + account, { 
                method: "GET",
            })
            let userLogsJson = await userLogs.json()
    
            let timestamps = rentalLogsJson["timestamps"] ? rentalLogsJson["timestamps"] : []
            let newLatestTimestamp = userLogsJson["latest_timestamp"] ? userLogsJson["latest_timestamp"] : latestTimestamp

            let [past, future] = splitTimestamp(timestamps, newLatestTimestamp)
            setRentalLogsJson(rentalLogsJson)
            setPastTimestamps(past)
            setFutureTimestamps(future)

            setBadgeCounters(future.length)
            setLatestTimestamp(newLatestTimestamp)
        }

    }

    const updateLatestTimestamp = async (setLatestTimestamp: React.Dispatch<React.SetStateAction<string>>, latestTimestamp: string) => {
        setLatestTimestamp(latestTimestamp)

        let PUTbody = JSON.stringify({
            account_id: account,
            latest_timestamp: latestTimestamp
        })

        let response = await fetch("http://172.30.0.1:8090/user-logs/" + account, { 
            method: "PUT",
            body:PUTbody
        })
        console.log(response)
        console.log("Update latest timestamp: ", latestTimestamp)

        let [past, future] = splitTimestamp(futureTimestamps, latestTimestamp)

        console.log("future timestamps", futureTimestamps)
        setPastTimestamps(pastTimestamps.concat(past))
        setFutureTimestamps(future)
        setBadgeCounters(future.length)
    }

    const RentalInfo = (): JSX.Element => {
        interface RentalLogById {
            requestorId:    string;
            nftId:          string;
            rentalPeriod:   string;
            timestamp:      string;
        }

        if (rentalLogsJson["timestamps"]) {
            let accountId = rentalLogsJson["account_id"]
            let rentalLogsById: RentalLogById[] = []

            for (let i = 0; i < rentalLogsJson["timestamps"].length; i++) {
                let rentalLog: RentalLogById = {
                    requestorId: rentalLogsJson["requestor_ids"][i].slice(0, 6) + "...",
                    nftId: rentalLogsJson["nft_ids"][i],
                    rentalPeriod: rentalLogsJson["rental_periods"][i],
                    timestamp: new Date(parseInt(rentalLogsJson["timestamps"][0])).toDateString(),
                }

                rentalLogsById.push(rentalLog)
            }

            return (
                <div>{
                    rentalLogsById.map((rentalLogById, index) => (
                        <div>
                            <MenuItem onClick={handleNotiClose}>
                                requestor_id: {rentalLogById["requestorId"]},
                                nft_id: {rentalLogById["nftId"]},
                                rental_period: {rentalLogById["rentalPeriod"]},
                                request_date: {rentalLogById["timestamp"]}
                            </MenuItem>  
                            <Divider />
                        </div>
                    ))}
                </div>
            )
        } else {
            return (
                <div>
                    <MenuItem onClick={handleNotiClose}>No rental request</MenuItem>
                </div>
            )
        }         
    }

    const DisplayNotification = (): JSX.Element => {
        return (
            <StyledMenu
                id="basic-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleNotiClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >                   
                <MenuItem onClick={handleNotiClose}>
                    {<h3>Rental request</h3>}    
                </MenuItem>  
                <RentalInfo />

                <MenuItem onClick={handleNotiClose}>
                    {<h3>Report</h3>}    
                </MenuItem>  
            </StyledMenu>
        )
    }

    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="absolute" open={open}>
                    <Toolbar
                        sx={{
                            pr: '24px', // keep right padding when drawer closed
                        }}
                    >
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            <Link href="/">
                                <a>Manual</a>
                            </Link>
                        </Typography>
                        <ConnectAccount
                            isConnected={isConnected}
                            setIsConnected={setIsConnected}
                            account={account}
                            setAccount={setAccount}
                            notificationHandler={notificationHandler}
                            setPastTimestamps={setPastTimestamps}
                            setFutureTimestamps={setFutureTimestamps}
                        />
                        <div>
                            <IconButton
                                color="inherit"
                                aria-controls={menuOpen ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={menuOpen ? 'true' : undefined}
                                onClick={handleNotiClick}
                            >
                                <Badge badgeContent={badgeCounters} color="secondary" onClick={
                                    () =>  {
                                        updateLatestTimestamp(setLatestTimestamp, new Date().getTime().toString());
                                    }
                                }>
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                            <DisplayNotification />
                        </div>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: [1],
                        }}
                    >
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        {mainListItems}
                    <Divider sx={{ my: 1 }} />
                        {
                            // { secondaryListItems }
                        //<Divider sx={{ my: 2 }} />
                        }
                    </List>
                </Drawer>

                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        {children}
                        {
                        //    <Copyright sx={{ pt: 4 }} />
                        }
                    </Container>
                </Box>
            </Box>
            <DisplayNotification />

        </ThemeProvider>

    );
}
