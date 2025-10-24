import apiService from './apiService';

class PetService {
  // Get all pets (admin) with pagination and optional customer filter
  async getAllPets(page = 1, limit = 15, customerId = null) {
    try {
      const params = {
        page,
        limit
      };

      // Add customerId filter if provided
      if (customerId) {
        params.customerId = customerId;
      }

      const result = await apiService.getWithParams('Pet/admin', params);
      console.log('getAllPets response:', result);
      
      // Extract pets and pagination info
      const { pets = [], pagination = {} } = result || {};
      
      if (!Array.isArray(pets)) {
        console.error('Invalid pets data format:', pets);
        return {
          pets: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        };
      }
      
      // Normalize pet data
      return {
        pets: pets.map(pet => this.normalizePetData(pet)),
        pagination
      };
    } catch (error) {
      console.error('Error in getAllPets:', error);
      return {
        pets: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  // Get pet by ID (admin)
  async getPetById(id) {
    try {
      const pet = await apiService.getById('Pet/admin', id);
      return this.normalizePetData(pet);
    } catch (error) {
      console.error('Error in getPetById:', error);
      throw error;
    }
  }

  // Create new pet (admin)
  async createPet(petData) {
    try {
      const { customerId, name, species, breed, birthDate, imageUrl, gender, weight, color, notes } = petData;
      
      // Normalize data for API
      const petDto = {
        customerId: customerId,
        name: name || '',
        species: species || null,
        breed: breed || null,
        birthDate: birthDate || null,
        imageUrl: imageUrl || null,
        gender: gender || null,
        weight: weight ? Number(weight) : null,
        color: color || null,
        notes: notes || null
      };
      
      console.log('Creating pet with data:', petDto);
      
      const result = await apiService.create('Pet/admin', petDto);
      return this.normalizePetData(result);
    } catch (error) {
      console.error('Error in createPet:', error);
      throw error;
    }
  }

  // Update pet (admin)
  async updatePet(id, petData) {
    try {
      const { name, species, breed, birthDate, imageUrl, gender, weight, color, notes } = petData;
      
      // Normalize data for API
      const petDto = {
        name: name || '',
        species: species || null,
        breed: breed || null,
        birthDate: birthDate || null,
        imageUrl: imageUrl || null,
        gender: gender || null,
        weight: weight ? Number(weight) : null,
        color: color || null,
        notes: notes || null
      };
      
      console.log('Updating pet with data:', petDto);
      
      const result = await apiService.update('Pet/admin', id, petDto);
      return this.normalizePetData(result);
    } catch (error) {
      console.error('Error in updatePet:', error);
      throw error;
    }
  }

  // Delete pet (admin)
  async deletePet(id) {
    try {
      return await apiService.delete('Pet/admin', id);
    } catch (error) {
      console.error('Error in deletePet:', error);
      throw error;
    }
  }

  // Search pets (admin)
  async searchPets(searchTerm, page = 1, limit = 15) {
    try {
      const params = {
        query: searchTerm, 
        page,
        limit
      };

      const result = await apiService.getWithParams('Pet/admin', params);
      console.log('searchPets response:', result);
      
      // Extract pets and pagination info
      const { pets = [], pagination = {} } = result || {};
      
      if (!Array.isArray(pets)) {
        console.error('Invalid search results format:', pets);
        return {
          pets: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        };
      }
      
      // Normalize pet data
      return {
        pets: pets.map(pet => this.normalizePetData(pet)),
        pagination
      };
    } catch (error) {
      console.error('Error in searchPets:', error);
      return {
        pets: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  // Get pets by customer ID (admin)
  async getPetsByCustomerId(customerId) {
    try {
      console.log('===== getPetsByCustomerId START =====');
      console.log('Getting pets for customer:', customerId, 'Type:', typeof customerId);
      
      // Ensure customerId is a number (backend expects integer)
      const customerIdNum = parseInt(customerId, 10);
      if (isNaN(customerIdNum)) {
        console.error('Invalid customerId - not a number:', customerId);
        return [];
      }
      
      console.log('Calling API: /Pet/admin?customerId=' + customerIdNum);
      
      // Call API with customerId as query parameter
      const result = await apiService.get(`/Pet/admin?customerId=${customerIdNum}&limit=1000&page=1`);
      console.log('getPetsByCustomerId full response:', result);
      
      // Extract pets from the response
      const { pets = [] } = result || {};
      console.log('Extracted pets array:', pets);
      console.log('Pets count:', pets.length);
      
      if (!Array.isArray(pets)) {
        console.error('Invalid pets data format:', pets);
        return [];
      }
      
      const normalizedPets = pets.map(pet => this.normalizePetData(pet));
      console.log('Normalized pets:', normalizedPets);
      console.log('===== getPetsByCustomerId END =====');
      
      return normalizedPets;
    } catch (error) {
      console.error('❌ Error in getPetsByCustomerId:', error);
      console.error('Error details:', error.message, error.stack);
      return [];
    }
  }

  // Normalize pet data to ensure consistent structure
  normalizePetData(pet) {
    if (!pet) return null;
    
    return {
      petId: pet.petId || pet.PetId,
      PetId: pet.PetId || pet.petId, // Add PascalCase variant
      customerId: pet.customerId || pet.CustomerId || pet.userId || pet.UserId,
      CustomerId: pet.CustomerId || pet.customerId || pet.userId || pet.UserId,
      customerName: pet.customerName || pet.CustomerName || pet.ownerName || pet.OwnerName,
      CustomerName: pet.CustomerName || pet.customerName || pet.ownerName || pet.OwnerName,
      name: pet.name || pet.Name || '',
      Name: pet.Name || pet.name || '',
      species: pet.species || pet.Species || null,
      Species: pet.Species || pet.species || null,
      breed: pet.breed || pet.Breed || null,
      Breed: pet.Breed || pet.breed || null,
      gender: pet.gender !== undefined ? pet.gender : (pet.Gender !== undefined ? pet.Gender : null),
      Gender: pet.Gender !== undefined ? pet.Gender : (pet.gender !== undefined ? pet.gender : null),
      birthDate: pet.birthDate || pet.BirthDate || null,
      BirthDate: pet.BirthDate || pet.birthDate || null,
      age: pet.age || pet.Age || null,
      Age: pet.Age || pet.age || null,
      color: pet.color || pet.Color || null,
      Color: pet.Color || pet.color || null,
      imageUrl: pet.imageUrl || pet.ImageUrl || null,
      ImageUrl: pet.ImageUrl || pet.imageUrl || null,
      notes: pet.notes || pet.Notes || null,
      Notes: pet.Notes || pet.notes || null,
      createdAt: pet.createdAt || pet.CreatedAt || null,
      CreatedAt: pet.CreatedAt || pet.createdAt || null,
      updatedAt: pet.updatedAt || pet.UpdatedAt || null,
      UpdatedAt: pet.UpdatedAt || pet.updatedAt || null,
      vaccinatedVaccines: pet.vaccinatedVaccines || pet.VaccinatedVaccines || null,
      VaccinatedVaccines: pet.VaccinatedVaccines || pet.vaccinatedVaccines || null
    };
  }

  // Get pet species options
  getSpeciesOptions() {
    return [
      { value: 'dog', label: 'Chó' },
      { value: 'cat', label: 'Mèo' },
      { value: 'bird', label: 'Chim' },
      { value: 'rabbit', label: 'Thỏ' },
      { value: 'hamster', label: 'Hamster' },
      { value: 'other', label: 'Khác' }
    ];
  }

  // Get gender options
  getGenderOptions() {
    return [
      { value: 0, label: 'Đực' },
      { value: 1, label: 'Cái' }
    ];
  }

  // Calculate age from birth date
  calculateAge(birthDate) {
    if (!birthDate) return 'Chưa có';
    
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} ngày`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return months > 0 ? `${years} năm ${months} tháng` : `${years} năm`;
    }
  }

  // Format birth date for form input (YYYY-MM-DD)
  formatBirthDateForInput(birthDate) {
    if (!birthDate) return '';
    
    try {
        const date = new Date(birthDate);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting birth date:', error);
      return '';
    }
  }
}

export default new PetService(); 