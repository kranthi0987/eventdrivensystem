import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import jwtEncode from 'jwt-encode';
import { v4 as uuidv4 } from 'uuid';

interface Event {
  id: string;
  name: string;
  body: string;
  timestamp: string;
  status?: 'pending' | 'success' | 'error';
  response?: any;
}

interface AuthConfig {
  payload: {
    service: string;
    id: string;
    [key: string]: any;
  };
}

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authConfig, setAuthConfig] = useState<AuthConfig>({
    payload: {
      service: 'source',
      id: 'source-app'
    }
  });
  const [eventBody, setEventBody] = useState('test body');
  const [eventName, setEventName] = useState('test event');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const generateToken = () => {
    try {
      const token = jwtEncode(authConfig.payload, 'dummy-secret', { algorithm: 'HS256' });
      setGeneratedToken(token);
      return token;
    } catch (err) {
      console.error('Error generating token:', err);
      return null;
    }
  };

  const triggerEvent = async () => {
    const event: Event = {
      id: uuidv4(),
      name: eventName,
      body: eventBody,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    try {
      setLoading(true);
      setError(null);


      // Add event to local state
      setEvents(prev => [...prev, event]);

      // Generate JWT token
      const token = generateToken();
      if (!token) {
        throw new Error('Failed to generate authentication token');
      }

      // Send event to bridge service
      const response = await axios.post('http://localhost:3001/api/events', event, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 202) {
        setEvents(prev => 
          prev.map(e => 
            e.id === event.id ? { 
              ...e, 
              status: 'success',
              response: response.data
            } : e
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to trigger event. Please try again.');
      setEvents(prev => 
        prev.map(e => 
          e.id === event.id ? { 
            ...e, 
            status: 'error',
            response: err.response?.data || err.message
          } : e
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const addPayloadField = () => {
    const newPayload = { ...authConfig.payload };
    const fieldName = `field${Object.keys(newPayload).length + 1}`;
    newPayload[fieldName] = '';
    setAuthConfig(prev => ({ ...prev, payload: newPayload }));
  };

  const removePayloadField = (field: string) => {
    const newPayload = { ...authConfig.payload };
    delete newPayload[field];
    setAuthConfig(prev => ({ ...prev, payload: newPayload }));
  };

  const updatePayloadField = (field: string, value: string) => {
    setAuthConfig(prev => ({
      ...prev,
      payload: {
        ...prev.payload,
        [field]: value
      }
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Event Monitor
      </Typography>

      <Accordion defaultExpanded sx={{ mb: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Authentication Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1">Payload Fields</Typography>
            {Object.entries(authConfig.payload).map(([field, value]) => (
              <Box key={field} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Field Name"
                  value={field}
                  disabled={field === 'service' || field === 'id'}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Value"
                  value={value}
                  onChange={(e) => updatePayloadField(field, e.target.value)}
                  sx={{ flex: 2 }}
                />
                {field !== 'service' && field !== 'id' && (
                  <Tooltip title="Remove field">
                    <IconButton onClick={() => removePayloadField(field)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={addPayloadField}
              startIcon={<ExpandMoreIcon />}
            >
              Add Field
            </Button>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                onClick={generateToken}
                color="secondary"
              >
                Generate Token
              </Button>
              {generatedToken && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Generated Token:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={generatedToken}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded sx={{ mb: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Event Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Event Body"
              multiline
              rows={4}
              value={eventBody}
              onChange={(e) => setEventBody(e.target.value)}
              fullWidth
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mb: 4 }}>
        <Button 
          variant="contained" 
          onClick={triggerEvent}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Trigger Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Body</TableCell>
              <TableCell>Response</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.id}</TableCell>
                <TableCell>{event.name}</TableCell>
                <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {event.status === 'pending' && <CircularProgress size={20} />}
                    {event.status === 'success' && (
                      <Alert severity="success" sx={{ py: 0 }}>
                        Success
                      </Alert>
                    )}
                    {event.status === 'error' && (
                      <Alert severity="error" sx={{ py: 0 }}>
                        Error
                      </Alert>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{event.body}</TableCell>
                <TableCell>
                  {event.response && (
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(event.response, null, 2)}
                    </pre>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;
