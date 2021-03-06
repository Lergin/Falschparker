<style>
  .leaflet-popup-content {
    margin: unset;
  }

  .leaflet-popup-content-wrapper {
    padding: unset;
  }
</style>

<template>
  <l-map ref="map" :max-zoom="17" :min-zoom="2">
    <l-tile-layer v-bind="tileProvider"></l-tile-layer>
    <v-marker-cluster :options="{ disableClusteringAtZoom: 17 }">
      <l-marker
      v-for="item in items"
      :key="item['.key']"
      :lat-lng="[item.loc.lat, item.loc.lon]"
      :title="item.kfz">
        <l-popup :options="{maxWidth: 350, minWidth: 350}">
          <report-card :license-plate="item.plate"
              :date="item.date"
              :location="{lat: item.loc.lat, lon: item.loc.lon}"
              :parking="item.parking"
              :endangering="item.endangering"
              :obstruction="item.obstruction"
              :with-intend="item.intend"
              :intend-reason="item.intendReason"
              :offence="item.where"
              :address="item.address"
              :images="[item.filePath]"></report-card>
        </l-popup>
      </l-marker>
    </v-marker-cluster>
  </l-map>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator'
import { L, LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet'
import Vue2LeafletMarkercluster from 'vue2-leaflet-markercluster'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import { ImageData } from '../../functions/lib/ImageData'
import '../vuefire'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'; 
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import ReportCard from '@/components/report-card/ReportCard.vue'

type FirebaseImageData = ImageData & { '.key': string }

delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
})

type OpenStreetMapTileProviderKey = 'watercolor' | 'dark' | 'base'

type OpenStreetMapTileProvider = L.TileLayerOptions & {
  url: string
  attribution: string
  ext?: string
}

const openStreetMapTileProvider: {readonly [K in OpenStreetMapTileProviderKey]: OpenStreetMapTileProvider} = {
  watercolor: {
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    ext: 'jpg'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
  },
  base: {
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc'
  }
}

function toLatLongs(imageData: ImageData[]): L.LatLngBoundsExpression {
    return imageData.map((data) => data.loc).filter((loc): loc is {lat: number, lon: number} => !!(loc && loc.lat && loc.lon)).map(({ lat, lon }) => [lat, lon] as [number, number]);
}

@Component({
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    'v-marker-cluster': Vue2LeafletMarkercluster,
    ReportCard
  },
  firebase () {
    const db = firebase.database()
    const user = firebase.auth().currentUser

    return {
      items: {
        source: db.ref('users').child(user ? user.uid : 'no-user').child('images'),
        asObject: false,
        readyCallback: function (this: MapView, e: firebase.database.DataSnapshot) {
          if (this.map?.mapObject != null) {
            const data: {[key: string]: ImageData} = e.val()

            const latLons: L.LatLngBoundsExpression = toLatLongs(Object.values(data));

            this.map?.mapObject.fitBounds(latLons);
          }
        }
      }
    }
  }
})
export default class MapView extends Vue {
  public items: FirebaseImageData[] = []
  public provider: OpenStreetMapTileProviderKey = 'watercolor'

  @Ref('map')
  public map?: HTMLElement & {mapObject?: L.Map};

  get tileProvider (): OpenStreetMapTileProvider {
    return openStreetMapTileProvider[this.provider]
  }

  mounted() {
    if (this.map?.mapObject != null) {
      const latLons: L.LatLngBoundsExpression = toLatLongs(this.items);
      this.map.mapObject.fitBounds(latLons);
    }
  }
}
</script>
