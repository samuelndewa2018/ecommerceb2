import {
  FooterContainer,
  FooterWrap,
  SocialMedia,
  SocialMediaWrap,
  SocialLogo,
  WebsiteRights,
  SocialIcons,
  SocialIconLink,
} from "./FooterElements.js";
import {
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
// import { MdAttachEmail } from "react-icons/fa";

const Footer = () => {
  return (
    <FooterContainer>
      <FooterWrap>
        <SocialMedia>
          <SocialMediaWrap>
            <SocialLogo to="/">Amaona</SocialLogo>
            <WebsiteRights>
              Amaona ©{new Date().getFullYear()} {""} All rights reserved
            </WebsiteRights>

            <SocialIcons>
              <SocialIconLink href="/contacts">
                <FaEnvelope />
              </SocialIconLink>
              <SocialIconLink
                href="//www.facebook.com/+254712012113"
                target="_blank"
                arial-label="Facebook"
              >
                <FaFacebook />
              </SocialIconLink>
              <SocialIconLink
                href="//instagram.com/samuelndewa201/"
                target="_blank"
                arial-label="Instagram"
              >
                <FaInstagram />
              </SocialIconLink>
              <SocialIconLink
                href="//t.me/+254712012113"
                target="_blank"
                arial-label="Telegram"
              >
                <FaTelegram />
              </SocialIconLink>
              <SocialIconLink
                href="//wa.me/+254712012113"
                target="_blank"
                arial-label="Whatsapp"
              >
                <FaWhatsapp />
              </SocialIconLink>
            </SocialIcons>
          </SocialMediaWrap>
        </SocialMedia>
      </FooterWrap>
    </FooterContainer>
  );
};

export default Footer;
