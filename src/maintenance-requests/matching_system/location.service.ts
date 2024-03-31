import { HttpException } from '@nestjs/common';
import axios from 'axios';
export class TechLocation {
  async getCoordsForAddress(address) {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${process.env.API_KEY}`,
    );
    const data = response.data;
    //console.log(data);

    if (!data || data.status === 'ZERO_RESULTS') {
      const error = new HttpException(
        'could not find the location of the specified address',
        422,
      );
      throw error;
    }
    const coordinates = data.results[0].geometry;
    return coordinates;
  }
  //la formule de Haversine pour calculer la distance
  async calculateDistance(address1, address2) {
    try {
      // Obtenir les coordonnées pour les deux adresses
      const coords1 = await this.getCoordsForAddress(address1);
      const coords2 = await this.getCoordsForAddress(address2);

      // Convertir les degrés en radians
      const lat1 = this.toRadians(coords1.lat);
      const lon1 = this.toRadians(coords1.lng);
      const lat2 = this.toRadians(coords2.lat);
      const lon2 = this.toRadians(coords2.lng);

      // Rayon de la Terre en kilomètres
      const R = 6371;

      // Calculer la différence de latitude et de longitude
      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;

      // Calculer la distance en utilisant la formule de Haversine
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance;
    } catch (error) {
      // Gérer les erreurs lors de la récupération des coordonnées
      console.error('Error calculating distance:', error.message);
      throw error;
    }
  }

  // Fonction utilitaire pour convertir les degrés en radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}
