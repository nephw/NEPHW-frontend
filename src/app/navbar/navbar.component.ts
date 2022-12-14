import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ethers } from 'ethers';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { WalletService } from 'src/shared/wallet.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  wallet$ = this.walletService.wallet$.pipe(
    tap(wallet => {
      if (wallet !== undefined) {
        this.navbarStateSub.next("LOGGED_IN")
      } else {
        this.navbarStateSub.next("LOGGED_OUT")
      }
    })
  )

  seedPhraseSub = new BehaviorSubject<string[] | undefined>(undefined)
  seedPhrase$ = this.seedPhraseSub.asObservable()

  navbarStateSub = new BehaviorSubject<NavbarState>('LOGGED_OUT')
  navbarState$ = this.navbarStateSub.asObservable()

  gas$ = this.walletService.getBalance(this.walletService.wallet?.address ?? "")

  importWalletForm = new FormControl('', [Validators.required, Validators.minLength(64)])

  constructor(private walletService: WalletService) { }

  ngOnInit(): void {
  }

  toggleLoginMenu() {
    if (this.navbarStateSub.getValue() === "OPTIONS_DISPLAYED") {
      this.navbarStateSub.next("LOGGED_OUT")
    } else {
      this.navbarStateSub.next("OPTIONS_DISPLAYED")
    }
  }

  closeCreateDialog() {
    this.seedPhraseSub.next(undefined)
  }

  submitSeedPhrase() {
    const mnemonic = this.seedPhraseSub.getValue()?.join(' ')
    if(mnemonic) {
      this.walletService.importWalletFromSeed(mnemonic)
      this.closeCreateDialog()
    }
  }

  setNavbarState(newState: NavbarState) {
    this.navbarStateSub.next(newState)
  }

  importWalletClicked() {
    const value = this.importWalletForm.value as string
    const splitValue = value.split(' ')

    if(splitValue.length === 1) {
      this.walletService.importWallet(value)
    } else {
      this.walletService.importWalletFromSeed(value)
    }
  }

  logOut() {
    this.walletService.removeWallet()
  }

  createWalletClicked() {
    this.seedPhraseSub.next(this.walletService.createWallet().mnemonic.phrase.split(' '))
  }

}

type NavbarState = "LOGGED_IN" | "LOGGED_OUT" | "OPTIONS_DISPLAYED" | "IMPORT"
