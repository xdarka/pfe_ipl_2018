import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MapRouteService } from '../services/map-route.service';
import { AddressesService } from '../services/addresses.service';
import { LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-direction-form',
  templateUrl: './direction-form.component.html',
  styleUrls: ['./direction-form.component.scss']
})
export class DirectionFormComponent implements OnInit {
  startInput: String;
  startJSON: any;
  endInput: String;
  endJSON: any;
  deployed: boolean;
  haveRoute: boolean;
  loader: HTMLIonLoadingElement;
  loaderPromise: Promise<void>;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private mapRouteService: MapRouteService,
    private addressesService: AddressesService,
    private loadingController: LoadingController,
    private navController: NavController
  ) {
    this.deployed = true;
    this.haveRoute = false;
  }

  ngOnInit() {
    this.addressesService.addressSubject.subscribe(addr => {
      if (addr['start']) {
        this.startJSON = addr['start'];
      }
      if (addr['end']) {
        this.endJSON = addr['end'];
      }
    });

    this.mapRouteService.routeSubject.subscribe(() => {
      this.deployed = false;
      this.haveRoute = true;
      this.removeLoader();
    });
  }

  onStartInputClick() {
    this.navController.navigateForward('/search/start', true);
  }

  onEndInputClick() {
    this.navController.navigateForward('/search/end', true);
  }

  onSearchRouteBtnClick() {
    //send coordinates to backend
    if (this.startJSON !== undefined && this.endJSON !== undefined) {
      this.mapRouteService.sendCoordinatesToServer(
        this.startJSON['x'],
        this.startJSON['y'],
        this.endJSON['x'],
        this.endJSON['y']
      );
      this.loaderPromise = this.afficheLoader();
    }
  }

  onChangerBtnClick() {
    this.deployed = true;
  }

  onAnnulerBtnClick() {
    this.deployed = false;
  }

  async afficheLoader() {
    this.loader = await this.loadingController.create({
      spinner: 'dots',
      message: 'Chargement de la route',
      animated: true,
      id: 'routeLoader',
      showBackdrop: true,
      translucent: true
    });
    return await this.loader.present();
  }

  async removeLoader() {
    this.loaderPromise.then(() => this.loader.dismiss());
  }
}
