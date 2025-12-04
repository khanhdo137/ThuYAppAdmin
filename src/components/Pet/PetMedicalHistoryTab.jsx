import { 
    Refresh as RefreshIcon,
    Description as DescriptionIcon,
    LocalHospital as TreatmentIcon,
    Notes as NotesIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as CheckIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Typography,
    Avatar,
    Paper,
    Badge
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { medicalHistoryService } from '../../services';

const PetMedicalHistoryTab = ({ petId, petName }) => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMedicalHistories = async () => {
    if (!petId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicalHistoryService.getMedicalHistoriesByPetId(petId, {
        page: 1,
        limit: 50
      });
      
      setHistories(response?.histories || []);
      
    } catch (err) {
      console.error('Error loading medical histories:', err);
      setError('Không thể tải lịch sử khám bệnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (petId) {
      loadMedicalHistories();
    }
  }, [petId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    loadMedicalHistories();
  };

  if (!petId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Chưa có thông tin thú cưng để hiển thị lịch sử khám bệnh
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5',
      minHeight: '500px',
      maxHeight: '70vh',
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '10px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '10px',
        '&:hover': {
          background: 'linear-gradient(135deg, #556ee6 0%, #654b92 100%)',
        }
      }
    }}>
      {/* Header với gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 3,
          pb: 2,
          px: 3,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'rgba(255,255,255,0.3)',
            width: 56,
            height: 56
          }}>
            <TimelineIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="600">
              Lịch sử khám bệnh
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {petName || 'Thú cưng'}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleRefresh} 
          disabled={loading}
          sx={{ 
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Content Area */}
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(244,67,54,0.2)'
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Đang tải lịch sử khám bệnh...
            </Typography>
          </Box>
        ) : histories.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 3,
              bgcolor: 'white',
              borderRadius: 3,
              border: '2px dashed #e0e0e0'
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#f3e5f5',
                margin: '0 auto 16px'
              }}
            >
              <TimelineIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
            </Avatar>
            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="600">
              Chưa có lịch sử khám bệnh
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, margin: '0 auto' }}>
              Lịch sử khám bệnh sẽ được tạo tự động khi hoàn thành lịch hẹn
            </Typography>
          </Paper>
        ) : (
        <Box sx={{ position: 'relative' }}>
          {/* Timeline line */}
          <Box
            sx={{
              position: 'absolute',
              left: '27px',
              top: '20px',
              bottom: '20px',
              width: '3px',
              background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px',
              opacity: 0.3
            }}
          />
          
          {histories.map((history, index) => (
            <Box 
              key={history.HistoryId || history.historyId}
              sx={{ 
                position: 'relative',
                mb: 3,
                ml: 7
              }}
            >
              {/* Timeline dot */}
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                badgeContent={
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: 'white',
                      border: '4px solid',
                      borderColor: index === 0 ? '#667eea' : '#e0e0e0',
                      position: 'absolute',
                      left: '-63px',
                      top: '8px',
                      boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                    }}
                  >
                    <CheckIcon sx={{ color: index === 0 ? '#667eea' : '#9e9e9e', fontSize: 28 }} />
                  </Avatar>
                }
              >
                <Box />
              </Badge>

              <Card 
                sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  border: index === 0 ? '2px solid #667eea' : '1px solid #e0e0e0',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(102,126,234,0.2)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Box>
                      <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#667eea' }}>
                        Khám bệnh #{history.HistoryId || history.historyId}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(history.RecordDate || history.recordDate)}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label="Hoàn thành" 
                      icon={<CheckIcon />}
                      sx={{
                        bgcolor: '#e8f5e9',
                        color: '#4caf50',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: '#4caf50'
                        }
                      }}
                    />
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Mô tả bệnh án */}
                  <Box mb={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd' }}>
                        <DescriptionIcon sx={{ fontSize: 18, color: '#2196f3' }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#2196f3' }}>
                        Mô tả bệnh án
                      </Typography>
                    </Box>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        borderLeft: '4px solid #2196f3'
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {history.Description || history.description || 'Không có mô tả'}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Phương pháp điều trị */}
                  <Box mb={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9' }}>
                        <TreatmentIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#4caf50' }}>
                        Phương pháp điều trị
                      </Typography>
                    </Box>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        borderLeft: '4px solid #4caf50'
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {history.Treatment || history.treatment || 'Không có thông tin điều trị'}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Ghi chú */}
                  {(history.Notes || history.notes) && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff3e0' }}>
                          <NotesIcon sx={{ fontSize: 18, color: '#ff9800' }} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#ff9800' }}>
                          Ghi chú
                        </Typography>
                      </Box>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: '#fff8e1',
                          borderRadius: 2,
                          borderLeft: '4px solid #ff9800'
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                          {history.Notes || history.notes}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
        )}

        {/* Footer thống kê */}
        {histories.length > 0 && (
          <Paper 
            elevation={0}
            sx={{ 
              mt: 4,
              p: 2.5,
              bgcolor: 'white',
              borderRadius: 3,
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8eaf6' }}>
                <TimelineIcon sx={{ fontSize: 18, color: '#667eea' }} />
              </Avatar>
              <Typography variant="body1" fontWeight="600" color="text.primary">
                Tổng cộng: {histories.length} lần khám bệnh
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default PetMedicalHistoryTab; 