import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import {
  Pets as PetsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

/**
 * PetCard - Component hiển thị thông tin thú cưng dạng card
 * Có thể tái sử dụng ở nhiều nơi trong ứng dụng
 */
export default function PetCard({ pet, onClick, showViewButton = true }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick ? {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          '& .view-icon': {
            opacity: 1
          }
        } : {}
      }}
      onClick={onClick}
    >
      {/* Pet Image */}
      <Box
        sx={{
          height: 200,
          background: pet.imageUrl || pet.image_url
            ? `url(${pet.imageUrl || pet.image_url})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        {/* Overlay on hover */}
        {onClick && showViewButton && (
          <Box
            className="view-icon"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s'
            }}
          >
            <IconButton
              sx={{
                bgcolor: 'white',
                '&:hover': { bgcolor: 'white' }
              }}
            >
              <VisibilityIcon sx={{ color: '#667eea', fontSize: 32 }} />
            </IconButton>
          </Box>
        )}

        {/* Pet Icon if no image */}
        {!(pet.imageUrl || pet.image_url) && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <PetsIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.5)' }} />
          </Box>
        )}
      </Box>

      <CardContent>
        <Typography variant="h6" fontWeight="600" gutterBottom noWrap>
          {pet.petName || pet.pet_name || 'N/A'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={pet.species || 'N/A'}
            size="small"
            sx={{
              bgcolor: '#e3f2fd',
              color: '#1976d2',
              fontWeight: 500
            }}
          />
          <Chip
            label={pet.breed || 'N/A'}
            size="small"
            sx={{
              bgcolor: '#f3e5f5',
              color: '#9c27b0',
              fontWeight: 500
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Ngày sinh:</strong> {formatDate(pet.birthday)}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Giới tính:</strong> {pet.gender || 'N/A'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Cân nặng:</strong> {pet.weight ? `${pet.weight} kg` : 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );
}



