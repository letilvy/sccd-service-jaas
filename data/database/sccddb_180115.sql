-- MySQL dump 10.13  Distrib 5.7.20, for Linux (x86_64)
--
-- Host: localhost    Database: sccd
-- ------------------------------------------------------
-- Server version	5.7.20-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `IT`
--

DROP TABLE IF EXISTS `IT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `IT` (
  `tcid` int(4) NOT NULL AUTO_INCREMENT,
  `pid` char(64) DEFAULT NULL,
  `type` char(3) DEFAULT 'UI5',
  `branch` char(32) DEFAULT 'master',
  `passed` int(4) DEFAULT NULL,
  `failed` int(4) DEFAULT NULL,
  `skipped` int(4) DEFAULT NULL,
  `assertion` int(4) DEFAULT NULL,
  `stmtcover` float DEFAULT NULL,
  `timestamp` char(14) DEFAULT NULL,
  PRIMARY KEY (`tcid`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `IT`
--

LOCK TABLES `IT` WRITE;
/*!40000 ALTER TABLE `IT` DISABLE KEYS */;
INSERT INTO `IT` VALUES (5,'sap.b1.smp.pum','UI5','master',19,18,1,38,NULL,'20180103121814'),(6,'sap.support.bydchat','UI5','master',11,0,0,24,NULL,'20180104011653'),(7,'sap.support.expertchat','UI5','master',19,1,0,76,NULL,'20180104012150'),(8,'sap.support.incidentform','UI5','master',60,0,0,182,NULL,'20180104091504'),(9,'sap.support.incidentform','UI5','master',60,0,0,182,NULL,'20180105095553'),(10,'sap.support.bydchat','UI5','master',11,0,0,24,NULL,'20180105091427'),(11,'sap.support.expertchat','UI5','master',19,1,0,76,NULL,'20180105090853'),(12,'sap.support.bydchat','UI5','master',11,0,0,24,NULL,'20180106143832'),(13,'sap.support.bydchat','UI5','master',11,0,0,24,NULL,'20180107080816'),(14,'sap.support.incidentdevopsdashboard','UI5','master',3,0,0,4,NULL,'20180108053915'),(15,'sap.support.expertchat','UI5','master',20,0,0,80,NULL,'20180108080308'),(16,'sap.support.guestuseradmin','UI5','master',0,5,4,6,NULL,'20180108102939'),(17,'sap.support.incidentform','UI5','master',60,0,0,182,NULL,'20180108091910'),(18,'sap.support.bydchat','UI5','master',11,0,0,24,NULL,'20180108141616'),(19,'sap.support.expertchat','UI5','master',20,0,0,80,NULL,'20180109063841'),(20,'sap.support.incidentform','UI5','transport',60,0,0,182,NULL,'20180109024509'),(21,'sap.support.incidentdevopsdashboard','UI5','master',0,3,0,3,NULL,'20180109075914'),(22,'sap.support.bydchat','UI5','master',11,0,0,24,NULL,'20180109072846'),(23,'sap.support.bydchat','UI5','master',11,0,0,24,NULL,'20180110051312'),(24,'sap.support.incidentform','UI5','master',60,0,0,182,NULL,'20180110101713'),(25,'sap.support.guestuseradmin','UI5','master',0,5,4,6,NULL,'20180110071752'),(26,'sap.support.incidentdevopsdashboard','UI5','master',3,0,0,4,NULL,'20180111113204'),(27,'sap.support.bydchat','UI5','master',11,0,0,24,NULL,'20180111051817'),(28,'sap.support.bydchat','UI5','master',11,0,0,25,NULL,'20180112100227'),(29,'sap.support.guestuseradmin','UI5','master',0,5,4,6,NULL,'20180115010451'),(30,'sap.support.bydchat','UI5','master',11,0,0,25,NULL,'20180115051300');
/*!40000 ALTER TABLE `IT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Project`
--

DROP TABLE IF EXISTS `Project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Project` (
  `pid` char(64) NOT NULL,
  `name` char(128) DEFAULT NULL,
  `description` varchar(512) DEFAULT NULL,
  `contact` char(12) DEFAULT NULL,
  `team` char(4) DEFAULT NULL,
  PRIMARY KEY (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Project`
--

LOCK TABLES `Project` WRITE;
/*!40000 ALTER TABLE `Project` DISABLE KEYS */;
/*!40000 ALTER TABLE `Project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Team`
--

DROP TABLE IF EXISTS `Team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Team` (
  `tid` char(4) NOT NULL,
  `name` char(32) DEFAULT NULL,
  `contact` char(32) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Team`
--

LOCK TABLES `Team` WRITE;
/*!40000 ALTER TABLE `Team` DISABLE KEYS */;
/*!40000 ALTER TABLE `Team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UT`
--

DROP TABLE IF EXISTS `UT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UT` (
  `tcid` int(4) NOT NULL AUTO_INCREMENT,
  `pid` char(64) DEFAULT NULL,
  `type` char(3) DEFAULT 'UI5',
  `branch` char(32) DEFAULT 'master',
  `passed` int(4) DEFAULT NULL,
  `failed` int(4) DEFAULT NULL,
  `skipped` int(4) DEFAULT NULL,
  `assertion` int(4) DEFAULT NULL,
  `stmtcover` float DEFAULT NULL,
  `timestamp` char(14) DEFAULT NULL,
  PRIMARY KEY (`tcid`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UT`
--

LOCK TABLES `UT` WRITE;
/*!40000 ALTER TABLE `UT` DISABLE KEYS */;
INSERT INTO `UT` VALUES (11,'sap.b1.smp.pum','UI5','master',28,4,0,38,NULL,'20180102091837'),(12,'sap.b1.smp.pum','UI5','master',28,4,0,38,NULL,'20180103121814'),(13,'sap.support.expertchat','UI5','master',244,0,0,426,NULL,'20180103121627'),(14,'sap.support.incidentform','UI5','master',287,0,0,452,NULL,'20180103121920'),(15,'sap.support.bydchat','UI5','master',68,0,0,91,NULL,'20180104011145'),(16,'sap.support.expertchat','UI5','master',244,0,0,426,NULL,'20180104011245'),(17,'sap.support.incidentform','UI5','master',290,0,0,455,NULL,'20180104090845'),(18,'sap.support.sae','UI5','master',413,0,0,755,NULL,'20180104082523'),(19,'sap.support.sbasystemdata','UI5','master',85,0,0,155,NULL,'20180104101742'),(20,'sap.support.guestuserpartner','UI5','master',80,0,0,141,NULL,'20180104093944'),(21,'sap.support.incidentform','UI5','master',290,0,0,455,NULL,'20180105094839'),(22,'sap.support.bydchat','UI5','master',68,0,0,91,NULL,'20180105090657'),(23,'sap.support.sae','UI5','master',413,0,0,747,NULL,'20180105095040'),(24,'sap.support.sbasystemdata','UI5','master',85,0,0,155,NULL,'20180105063557'),(25,'sap.support.expertchat','UI5','master',244,0,0,426,NULL,'20180105090120'),(26,'sap.support.bydchat','UI5','master',68,0,0,91,NULL,'20180106150505'),(27,'sap.support.bydchat','UI5','master',68,0,0,91,NULL,'20180107075708'),(28,'sap.support.incidentdevopsdashboard','UI5','master',26,0,0,28,NULL,'20180108053915'),(29,'sap.support.expertchat','UI5','master',244,0,0,426,NULL,'20180108075837'),(30,'sap.support.bydchat','UI5','master',69,0,0,92,NULL,'20180108074731'),(31,'sap.b1.smp.pum','UI5','master',28,4,0,38,NULL,'20180108070541'),(32,'sap.support.guestuseradmin','UI5','master',146,0,0,234,NULL,'20180108102111'),(33,'sap.support.guestuserpartner','UI5','master',80,0,0,141,NULL,'20180108075222'),(34,'sap.support.incidentform','UI5','master',290,0,0,455,NULL,'20180108091230'),(35,'sap.support.sae','UI5','master',413,0,0,747,NULL,'20180108104542'),(36,'sap.support.sbasystemdata','UI5','master',85,0,0,155,NULL,'20180108085751'),(37,'sap.support.expertchat','UI5','master',246,0,0,429,NULL,'20180109021450'),(38,'sap.support.newsystemeudp','UI5','master',21,0,0,27,NULL,'20180109020656'),(39,'sap.support.sscr','UI5','master',2,0,0,2,NULL,'20180109020951'),(40,'sap.support.mk','UI5','master',8,0,0,29,NULL,'20180109022034'),(41,'sap.support.incidentform','UI5','master',290,0,0,455,NULL,'20180109063539'),(42,'sap.b1.smp.pum','UI5','master',28,4,0,38,NULL,'20180109110043'),(43,'sap.support.sae','UI5','master',413,0,0,747,NULL,'20180109085206'),(44,'sap.support.bydchat','UI5','master',69,0,0,93,NULL,'20180109071103'),(45,'sap.support.incidentdevopsdashboard','UI5','master',26,0,0,28,NULL,'20180109075914'),(46,'sap.support.sae','UI5','master',411,0,0,743,NULL,'20180110093846'),(47,'sap.support.bydchat','UI5','master',69,0,0,93,NULL,'20180110051251'),(48,'sap.support.solutionV2','UI5','master',130,7,0,141,NULL,'20180110061529'),(49,'sap.support.incidentform','UI5','master',290,0,0,455,NULL,'20180110100749'),(50,'sap.support.nnfv2','UI5','master',78,3,0,110,NULL,'20180110065758'),(51,'sap.support.guestuseradmin','UI5','master',146,0,0,234,NULL,'20180110071308'),(52,'sap.support.incidentdevopsdashboard','UI5','master',26,0,0,28,NULL,'20180111113204'),(53,'sap.support.bydchat','UI5','master',77,0,0,102,NULL,'20180111102359'),(54,'sap.support.sae','UI5','master',411,0,0,743,NULL,'20180111085235'),(55,'sap.support.bydchat','UI5','master',76,0,0,100,NULL,'20180112070859'),(56,'sap.b1.smp.pum','UI5','master',226,0,0,544,NULL,'20180112100459'),(57,'sap.support.bydchat','UI5','master',77,0,0,101,NULL,'20180115051245'),(58,'sap.support.expertchat','UI5','master',252,0,0,442,NULL,'20180115064957'),(59,'sap.support.incidentform','UI5','master',290,0,0,455,NULL,'20180115075056');
/*!40000 ALTER TABLE `UT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `uid` char(12) NOT NULL,
  `team` char(4) DEFAULT NULL,
  `email` char(60) DEFAULT NULL,
  `firstname` char(35) DEFAULT NULL,
  `lastname` char(35) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-15  8:42:49
