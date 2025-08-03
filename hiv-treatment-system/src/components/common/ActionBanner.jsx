import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  BeakerIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import "./ActionBanner.css";

const ActionBanner = () => {
  return (
    <div className="action-banner-container">
      <div className="action-banner">
        <Link to="/customer/appointment-selection" className="action-item">
          <div className="action-icon">
            <CalendarIcon className="icon" />
          </div>
          <div className="action-content">
            <h4 className="action-title">Đặt lịch hẹn</h4>
            <p className="action-description">
              Đặt lịch hẹn nhanh chóng, tiện lợi
            </p>
          </div>
        </Link>

        <Link to="/customer/test-results" className="action-item">
          <div className="action-icon">
            <BeakerIcon className="icon" />
          </div>
          <div className="action-content">
            <h4 className="action-title">Tra cứu xét nghiệm</h4>
            <p className="action-description">
              Tra cứu thông tin xét nghiệm nhanh chóng
            </p>
          </div>
        </Link>

        <Link to="/customer/medications" className="action-item">
          <div className="action-icon">
            <ClockIcon className="icon" />
          </div>
          <div className="action-content">
            <h4 className="action-title">Thuốc điều trị</h4>
            <p className="action-description">
              Tìm hiểu thông tin chi tiết về đơn thuốc
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ActionBanner;
