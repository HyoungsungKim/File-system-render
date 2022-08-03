import * as React from 'react';
import { ethers } from 'ethers';
import {ListItem, ListItemIcon, ListItemText} from '@mui/material';
import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
    MemoryRouter,
  } from 'react-router-dom';
import { StaticRouter} from 'react-router-dom/server'

declare global {
    interface Window {
        ethereum: any;
    }
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
}

interface SpanProps extends React.HTMLAttributes<HTMLSpanElement> {
    title: string;   
}

interface ListItemLinkProps {
    icon?: React.ReactElement;
    primary: string;
    to: string;
}

class Connect {
    private provider: ethers.providers.Web3Provider;
    private signer: ethers.providers.JsonRpcSigner;

    constructor(externalProvider: ethers.providers.ExternalProvider) {
        this.provider = new ethers.providers.Web3Provider(externalProvider)
        this.signer = this.provider.getSigner();
    }

    getProvider(): ethers.providers.Web3Provider {
        return this.provider;
    }

    getSigner(): ethers.providers.JsonRpcSigner | undefined {
        return this.signer;
    }
}

// eth_getEncryptionPublicKey will be deprecated 
function encryptAddress(address: string): Promise<string> {
    return window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [address]
    })

    /*
    .then((encryptionPublicKey: string) => {
        return encryptionPublicKey
    })
    .catch((error: any) => {
        if (error.code === 4001) {
            console.log("we cannot encrypt anything without the key")
            return "4001";
        } else {
            console.log(error)
            return error
        }
    })
    */
}

function Router(props: { children: React.ReactNode}) {
    const {children} = props;
    if (typeof window == 'undefined') {
        return <StaticRouter location="/">{children}</StaticRouter>
    }

    return (
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
            {children}
        </MemoryRouter>
    )
}

function ListItemLink(props: ListItemLinkProps) {
    const { icon, primary, to } = props;
    const renderLink = React.useMemo(
        () => 
        React.forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'>>(function Link(
            itemProps,
            ref,
        ) {
            return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
        }),
        [to],
    )

    return (
        <li>
          <ListItem button component={renderLink}>
            {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
            <ListItemText primary={primary} />
          </ListItem>
        </li>
      );
}

export {Connect, Router, ListItemLink, encryptAddress}
export type {ButtonProps, SpanProps}