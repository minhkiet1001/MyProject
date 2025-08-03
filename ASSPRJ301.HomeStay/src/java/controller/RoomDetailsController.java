package controller;

import dao.RoomDAO;
import dto.RoomDTO;
import java.io.IOException;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "RoomDetailsController", urlPatterns = {"/room-details"})
public class RoomDetailsController extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(RoomDetailsController.class.getName());
    private static final String HOME_PAGE = "home.jsp";
    private static final String DETAILS_PAGE = "room-details.jsp";

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");

        String roomIdStr = request.getParameter("roomId");
        if (roomIdStr == null || roomIdStr.trim().isEmpty()) {
            response.sendRedirect(HOME_PAGE);
            return;
        }

        int roomId;
        try {
            roomId = Integer.parseInt(roomIdStr);
            if (roomId <= 0) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID phòng phải lớn hơn 0");
                return;
            }
        } catch (NumberFormatException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID phòng không hợp lệ");
            return;
        }

        try {
            RoomDAO roomDAO = new RoomDAO();
            RoomDTO room = roomDAO.getRoomById(roomId);
            if (room != null) {
                LOGGER.log(Level.INFO, "Loaded room details for ID: " + roomId);
                request.setAttribute("room", room);
                request.getRequestDispatcher(DETAILS_PAGE).forward(request, response);
            } else {
                LOGGER.log(Level.WARNING, "Room not found for ID: " + roomId);
                response.sendRedirect(HOME_PAGE);
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error loading room details for ID: " + roomId, e);
            request.setAttribute("error", "Không thể tải chi tiết phòng");
            request.getRequestDispatcher(HOME_PAGE).forward(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }
}
