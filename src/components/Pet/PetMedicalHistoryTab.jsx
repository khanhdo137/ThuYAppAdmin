import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    List,
    ListItem,
    Typography
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
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color="primary">
          Lịch sử khám bệnh - {petName}
        </Typography>
        <IconButton 
          onClick={handleRefresh} 
          disabled={loading}
          size="small"
          sx={{ color: 'primary.main' }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : histories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Chưa có lịch sử khám bệnh nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lịch sử khám bệnh sẽ được tạo tự động khi hoàn thành lịch hẹn
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%' }}>
          {histories.map((history, index) => (
            <React.Fragment key={history.HistoryId || history.historyId}>
              <ListItem 
                alignItems="flex-start" 
                sx={{ 
                  px: 0,
                  flexDirection: 'column',
                  alignItems: 'stretch'
                }}
              >
                <Card sx={{ width: '100%', mb: 1 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" component="div" gutterBottom>
                          Khám bệnh #{history.HistoryId || history.historyId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(history.RecordDate || history.recordDate)}
                        </Typography>
                      </Box>
                      <Chip 
                        label="Hoàn thành" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Mô tả bệnh án:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {history.Description || history.description || 'Không có mô tả'}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Phương pháp điều trị:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {history.Treatment || history.treatment || 'Không có thông tin điều trị'}
                      </Typography>
                    </Box>

                    {(history.Notes || history.notes) && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Ghi chú:
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {history.Notes || history.notes}
                        </Typography>
                      </Box>
                    )}

                    {history.Pet && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                          Thú cưng: {history.Pet.Name} | 
                          Chủ sở hữu: {history.Pet.Customer?.CustomerName || 'N/A'}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </ListItem>
              {index < histories.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}

      {histories.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Tổng cộng: {histories.length} lần khám bệnh
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PetMedicalHistoryTab; 