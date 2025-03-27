#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define ports
FRONTEND_PORT=3000
API_PORT=3001

# Function to check if a port is in use
is_port_in_use() {
  lsof -i:$1 >/dev/null 2>&1
  return $?
}

# Function to get process ID for a port
get_pid_for_port() {
  lsof -ti:$1
}

# Function to display status
show_status() {
  if is_port_in_use $FRONTEND_PORT; then
    echo -e "${GREEN}✓${NC} Frontend server is running on port $FRONTEND_PORT (PID: $(get_pid_for_port $FRONTEND_PORT))"
  else
    echo -e "${RED}✗${NC} Frontend server is not running"
  fi

  if is_port_in_use $API_PORT; then
    echo -e "${GREEN}✓${NC} API server is running on port $API_PORT (PID: $(get_pid_for_port $API_PORT))"
  else
    echo -e "${RED}✗${NC} API server is not running"
  fi
}

# Function to start servers
start_servers() {
  echo -e "${BLUE}Starting EquipTrack servers...${NC}"
  
  # Check if servers are already running
  if is_port_in_use $FRONTEND_PORT; then
    echo -e "${YELLOW}⚠ Frontend server is already running on port $FRONTEND_PORT${NC}"
  else
    echo -e "${YELLOW}Starting frontend server...${NC}"
    npm run dev > logs/frontend.log 2>&1 & 
    echo -e "${GREEN}✓${NC} Frontend server started on port $FRONTEND_PORT"
  fi

  if is_port_in_use $API_PORT; then
    echo -e "${YELLOW}⚠ API server is already running on port $API_PORT${NC}"
  else
    echo -e "${YELLOW}Starting API server...${NC}"
    npm run api > logs/api.log 2>&1 &
    echo -e "${GREEN}✓${NC} API server started on port $API_PORT"
  fi
  
  echo -e "${BLUE}Server URLs:${NC}"
  echo -e "  Frontend: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
  echo -e "  API:      ${GREEN}http://localhost:$API_PORT${NC}"
}

# Function to stop servers
stop_servers() {
  echo -e "${BLUE}Stopping EquipTrack servers...${NC}"
  
  if is_port_in_use $FRONTEND_PORT; then
    echo -e "${YELLOW}Stopping frontend server...${NC}"
    kill -9 $(get_pid_for_port $FRONTEND_PORT) 2>/dev/null
    echo -e "${GREEN}✓${NC} Frontend server stopped"
  else
    echo -e "${YELLOW}⚠ Frontend server is not running${NC}"
  fi

  if is_port_in_use $API_PORT; then
    echo -e "${YELLOW}Stopping API server...${NC}"
    kill -9 $(get_pid_for_port $API_PORT) 2>/dev/null
    echo -e "${GREEN}✓${NC} API server stopped"
  else
    echo -e "${YELLOW}⚠ API server is not running${NC}"
  fi
}

# Ensure logs directory exists
mkdir -p logs

# Process command line arguments
case "$1" in
  start)
    start_servers
    ;;
  stop)
    stop_servers
    ;;
  restart)
    stop_servers
    sleep 2
    start_servers
    ;;
  status)
    echo -e "${BLUE}EquipTrack Server Status:${NC}"
    show_status
    ;;
  *)
    echo -e "${YELLOW}Usage: $0 {start|stop|restart|status}${NC}"
    exit 1
    ;;
esac

exit 0 